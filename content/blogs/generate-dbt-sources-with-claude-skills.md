---
title: "Generate dbt sources with Claude Skills"
description: "Half the teams I work with generate dbt sources with dbt-codegen, half just ask an AI. Here's the setup I've landed on that splits the job between them."
pubDate: 2026-09-02
heroImage: '/images/logo_resized.webp'
tags: ["dbt", "Analytics Engineering", "Artificial Intelligence"]
---
Roughly half the teams I work with generate their dbt sources with `dbt-codegen`. The other half open an AI chat and ask for the YAML.

`dbt-codegen` is a [dbt Labs package](https://github.com/dbt-labs/dbt-codegen) that generates YAML and SQL from your warehouse. With `generate_columns` turned on, its `generate_source` macro reads `information_schema` and returns every column with its real name and type, the same result every run. It leaves every description blank rather than guess at one, and it adds no tests. That part is on you.

Asking an LLM is less work. One prompt gets you the YAML, the descriptions, and the tests too if you want them. The catch is consistency: it might invent a column that isn't there, write a description from nothing but the column name, or make an assumption where you'd rather it stopped to ask.

Both have real gaps, so this isn't a post about which one is right. It's about splitting the work: codegen for the column list, the model for the descriptions and tests codegen won't touch.

## Where Each One Stops

### Codegen

Codegen's `generate_source` and `generate_base_model` macros query `information_schema` directly, so the column list they return is the real one: right names, right types, nothing invented.

```bash
dbt --quiet run-operation generate_source \
  --args '{"schema_name": "raw", "database_name": "analytics", "generate_columns": true, "include_descriptions": true, "table_names": ["charges"]}'
```

What comes back is a skeleton: every column is present, every `description` is blank, no tests, no `loaded_at_field`. The descriptions and tests are left to you, and on many teams they never get added. The source file stays accurate but undocumented.

### Asking the AI

An LLM will do the judgment pass. It writes a plausible description for `order_total`, infers that `customer_id` references a customers table, and in a staging model it casts timestamps and converts `'Y'`/`'N'` to a boolean without being asked. This is repetitive work, and the model handles it well.

The weak point is the column list. If the model has never seen your `charges` table, it fills in the columns a Stripe charges table usually has. Sometimes that matches. Sometimes `amount` is actually `amount_captured`, the timestamp is epoch seconds, and a `balance_transaction_id` you needed is missing. The YAML parses and reads fine in review; the error surfaces later, when a downstream number looks wrong.

There's also a cost difference. If the model writes the whole file, every line is output tokens, which are billed higher than input tokens.

## The Split

Codegen runs first and writes the skeleton. The model then gets a file where every column is already correct, so its whole job is the part that takes judgment: what each column means, which one is the primary key, what deserves a `not_null` test. **Structure from codegen, content from the model.**

One rule for that pass: only write what the table in front of you supports. `order_id` is an identifier, so it gets `not_null` and `unique`. `customer_id` is most likely a foreign key, and the description can say so. `flag_3` has no clear meaning, so its description stays blank or says "unknown." A blank description is better than a confident wrong one, which is hard to catch in review.

## Pipe It Straight to a File

Codegen wraps its YAML in `INFO` and `OK` log lines. Reading those into the model's context costs tokens, and more again if the model then re-types the YAML as output. When an agent runs codegen repeatedly, this adds up.

Redirect it to the file and open the file instead:

```bash
dbt --quiet run-operation generate_source \
  --args '{"schema_name": "raw", "table_names": ["charges", "customers"]}' \
  > models/staging/stripe/stripe.yml
```

Read the raw output only when you want to check a large multi-table run before it's written to disk.

## Staging Models Split the Same Way

`generate_base_model` returns a `select` with the source's raw column names, no casts, in a CTE structure.

```bash
dbt --quiet run-operation generate_base_model \
  --args '{"source_name": "stripe", "table_name": "charges"}' \
  > models/staging/stripe/stg_stripe__charges.sql
```

From that skeleton, the staging model casts every column explicitly instead of relying on implicit typing, and renames the bare `id` to `charge_id` so it's unambiguous in a join. It converts `'Y'`/`'N'` to a boolean after checking the distinct values, lowercases emails while leaving names in title case, and trims only the columns that carry whitespace.

None of this is hard, and a model works through it quickly. Codegen doesn't do this part. By hand it's repetitive work that often gets skipped under time pressure.

## When I Reach For It

This adds a step that neither approach uses on its own. If your team already runs codegen and fills in the descriptions, or already relies on an LLM for tables it can see, you don't need it. I use it when onboarding a warehouse I don't know yet.

---

## The Skills

Here's the workflow as two [Claude Code skills](https://code.claude.com/docs/en/skills), split the way the work actually splits: one for the source YAML, one for the staging model. Both run codegen first for structure, then a judgment pass for content, and both default to piping codegen's output straight to a file instead of reading its run log into context — that log is pure overhead, and re-typing the YAML as output costs more again. Save them to `.claude/skills/dbt-codegen-sources/SKILL.md` and `.claude/skills/dbt-codegen-staging/SKILL.md`. Ask Claude to add a source and the first one runs; ask it to stage a table and the second one runs. Onboarding a new table end to end triggers both, in order.

````markdown
---
name: dbt-codegen-sources
description: Use this skill whenever the user wants to create or update a dbt source YAML file. Trigger on "add a source", "generate_source", "dbt-codegen", or a raw table/schema that needs a dbt source defined, even if they don't name codegen explicitly. Runs dbt-codegen's generate_source macro against the warehouse first for the real column list, then fills in descriptions and tests as a second pass — never by inventing columns from memory of what a similarly-named table usually looks like.
---

# dbt codegen: sources

`generate_source` queries `information_schema` directly, so the column list it returns is real: right names, right types, nothing invented. It leaves every description blank and adds no tests — that part is the judgment pass, evidence-based only.

**Structure comes from codegen, content comes from you.**

## File handling

One file per source system, named `<source_name>.yml` (e.g. `stripe.yml`). If a source with this name already exists, generate to a temp file, diff it against the existing one, and discuss what changed (new/deleted/changed columns) before merging — never overwrite without showing the diff. After writing, run `git diff` so the user can review. Never run `git add` or `git commit` unless asked.

## Step 1: Run codegen, piped straight to file

```bash
dbt --quiet run-operation generate_source \
  --args '{"schema_name": "<schema>", "database_name": "<database>", "generate_columns": true, "include_descriptions": true, "table_names": ["<table>"]}' \
  > models/staging/<source_dir>/<source_name>.yml
```

- `schema_name` is required; everything else is optional. Omit `table_names` to generate every table in the schema.
- `--quiet` suppresses dbt's run logs. Without it, log noise lands in the file.
- Pass multiple `table_names` to batch a whole source into one file.
- Default to this redirect. Read stdout instead only if the user asks to review the output before it's written.

## Step 2: Judgment pass

For each table and column, fill in:
- **`description`** — only what the column name, type, or its relation to other visible columns supports. If a column's purpose isn't inferable, leave it empty or say so. An empty description is honest; an invented one is a bug no one catches until they trust it.
- **Tests** — `not_null` / `unique` on primary-key-shaped columns (typically `id` or `<table>_id`).
- **`loaded_at_field`** — only if there's a clear freshness-tracking timestamp (e.g. `_loaded_at`, `updated_at`).
- **Foreign keys** — note them in the description only if the column name makes the reference unambiguous (e.g. `customer_id`). Don't add a `relationships` test unless asked; that requires knowing the referenced model exists and is named correctly.

## Step 3: Validate

```bash
dbt parse
```
````

````markdown
---
name: dbt-codegen-staging
description: Use this skill whenever the user wants to create or update a dbt staging model (stg_*.sql) and its YAML. Trigger on "stage a table", "generate_base_model", "dbt-codegen", or turning a raw source into a staging model, even if they don't name codegen explicitly. Runs dbt-codegen's generate_base_model macro for the raw select skeleton first, then refactors it to dbt Labs' staging conventions (casts, renames, boolean and casing cleanup) as a second pass. Expects the source already defined — pair with the dbt-codegen-sources skill if it isn't.
---

# dbt codegen: staging models

`generate_base_model` returns a `select` with the source's raw column names, no casts, in a CTE structure. Treat that as a starting point, not the finished model.

**File and folder conventions** (per [dbt Labs' best-practices guide](https://docs.getdbt.com/best-practices/how-we-structure/2-staging)):
- One subdirectory per source system under `models/staging/` (e.g. `staging/stripe/`). A single-source project can stay flat.
- File name: `stg_[source]__[entity]s.sql`, plural entity, double underscore when there's more than one source system. Single-source: `stg_orders.sql` is clear enough.
- Materialize the staging directory as views:
  ```yaml
  # dbt_project.yml
  models:
    <project_name>:
      staging:
        +materialized: view
  ```

## File handling

If `stg_<table>.sql` already has logic in it, generate to a temp file and diff it — never overwrite working SQL without showing the diff. After writing, run `git diff`. Never run `git add` or `git commit` unless asked.

## Step 1: Run codegen for the SQL skeleton, piped to file

```bash
dbt --quiet run-operation generate_base_model \
  --args '{"source_name": "<source>", "table_name": "<table>"}' \
  > models/staging/<dir>/stg_<table>.sql
```

Optional args: `leading_commas` (default false), `materialized`, `case_sensitive_cols`. As with sources, default to the redirect; read stdout instead only if the user wants to review first.

For several tables from the same source at once, `codegen.create_base_models` writes files directly, no manual redirect needed. It runs a bundled bash script and is **not compatible with the dbt Cloud IDE** — local/CLI only:

```bash
dbt run-operation codegen.create_base_models --args '{"source_name": "<source>", "tables": ["<table_1>", "<table_2>"]}'
```

## Step 2: Refactor to staging conventions

dbt Labs names the standard staging transformations as renaming, type casting, basic computations, and categorizing — explicitly **not** joins or aggregations; those belong downstream.

- **Cast every column explicitly.** Don't rely on the warehouse's implicit typing. Check the real type from `information_schema.columns` (already queried by `generate_source`, or query directly) and cast in the select: `created_at::timestamp as created_at`, `amount::numeric as amount_usd`.
- **Give ambiguous columns joinable names.** A bare `id` becomes `<singular_table>_id` (`users.id` → `user_id`). Same for other names that only make sense in context (`name` → `user_name`, `status` → `order_status`). Test: would this still be unambiguous seen alone, three models downstream?
- **Normalize casing to fit the content, not a blanket rule.** Proper nouns → title case; codes, statuses, and emails → lowercase for consistent joins and filters (`lower(email) as email`); a fixed display label → uppercase if that's the convention. Use the warehouse's title-case function (e.g. Snowflake's `initcap()`) rather than hand-rolling one.
- **Turn bad booleans into real booleans.** Source systems encode true/false as `0`/`1`, `'Y'`/`'N'`, `'Yes'`/`'No'`. Check the actual distinct values before assuming the encoding, then cast: `case when is_active = 'Y' then true when is_active = 'N' then false end as is_active`.
- **Trim only where whitespace is actually a problem.** Check the data before reflexively wrapping every string column in `trim()`.
- Staging owns renaming, casting, and this light cleanup only — no joins, no aggregations, no business logic. A join that's genuinely unavoidable to stage a concept cleanly (e.g. a delete-tracking table) belongs in a `base` model, not a shortcut past intermediate.
- Keep the `with source as (...)` CTE structure codegen gives you — you're filling in the `renamed` CTE's select list. Group related columns under a short comment header (`---------- ids`, `---------- strings`, `---------- booleans`, `---------- timestamps`); it's dbt Labs' own convention and makes a wide rename block scannable.

## Step 3: Generate the model's own YAML, piped to file

Once the model compiles, so the column list is model-accurate rather than retyped from memory:

```bash
dbt --quiet run-operation generate_model_yaml \
  --args '{"model_names": ["stg_<table>"]}' \
  > models/staging/<dir>/stg_<table>.yml
```

Apply the same judgment pass as sources: descriptions and tests, evidence-based only.

## Step 4: Validate

```bash
dbt parse
```
````
