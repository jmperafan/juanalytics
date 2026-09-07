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

## The Skill

Here's the workflow as a [Claude Code skill](https://code.claude.com/docs/en/skills): codegen first, judgment pass second, plus the file conventions, the diff-before-overwrite rule, and the staging refactors from [dbt Labs' best-practices guide](https://docs.getdbt.com/best-practices/how-we-structure/2-staging). Save it to `.claude/skills/dbt-codegen/SKILL.md` and it runs whenever you ask Claude to add a source or stage a table.

````markdown
---
name: dbt-codegen
description: Use this skill whenever the user wants to create, scaffold, or update dbt source YAML files or staging models (stg_*). Trigger especially when they mention codegen, dbt-codegen, generate_source, generate_base_model, or ask to "add a source" / "stage a table" / "onboard a new table" into a dbt project. Also trigger when a user describes a new raw table, schema, or dataset that needs a dbt source and corresponding staging model, even if they don't name codegen explicitly. This skill produces the source/staging skeleton by introspecting the warehouse via the dbt-labs/codegen package first, then fills in descriptions and tests as a second pass: never by inventing column names from memory of what a table "probably" looks like.
---

# dbt codegen: sources and staging models

## Why this skill exists

There are two common ways to scaffold a dbt source or staging model. One is
dbt-codegen's `generate_source` / `generate_base_model`, which query
`information_schema` and return the real column list. The other is to let the
model write the YAML from whatever context is around: seed files, existing
models, or general knowledge of what a similarly-named table usually contains.

Codegen gets the structure right but stops at an empty skeleton: blank
descriptions, no tests, no `loaded_at_field`. Writing the YAML freehand covers
the judgment parts but can invent columns that aren't there, producing YAML that
parses and looks plausible but is wrong. On a warehouse table nobody on the team
has queried, the warehouse is the only reliable source of the schema.

This skill runs codegen for the skeleton, then fills in descriptions and tests as
a second pass, using only what's supported by the column names, types, and the
source's other columns, not prior knowledge of a similarly-named dataset
elsewhere.

**Structure comes from codegen, content comes from you.**

There's also a token-cost reason to keep this order. Reading a macro's full run
log into context (all the `INFO`/`OK` lines dbt prints around the actual YAML) is
pure overhead, and if the model then re-types the YAML as output, those tokens
bill higher than input. Piping the macro's output straight to a file and only
opening the file afterward is both the cheapest and the most accurate path.
Default to that unless the user asks to review before it's written.

## File handling

This skill runs against the user's actual dbt project on disk. Before writing, check whether the file already exists:

- **For source YAML files**: each source gets its own file named `<source_name>.yml` (e.g., `stripe.yml`, `salesforce.yml`). If a source for that table already exists, generate to a temp file, diff it against the existing source, and discuss what changed (new columns, deleted columns, type changes). Apply the judgment pass to just the new/changed parts. Never overwrite without showing the diff first.
- **For staging model files**: if `stg_<table>.sql` already exists with logic in it, generate to a temp file first and diff it. Never overwrite working SQL without the user seeing the diff.

After writing any file, run `git diff` so the user can review exactly what changed before staging or committing. Never run `git add` or `git commit` yourself unless asked.

## Part 1: Sources

**Step 1: Run codegen, piped straight to file.**

One file per source system (e.g., `models/staging/stripe/stripe.yml`). You can generate one table at a time or batch a whole source:

```bash
# Single table
dbt --quiet run-operation generate_source \
  --args '{"schema_name": "<schema>", "database_name": "<database>", "generate_columns": true, "include_descriptions": true, "table_names": ["<table>"]}' \
  > models/staging/<source_dir>/<source_name>.yml
```

```bash
# Multiple tables from the same source, appended to one file
dbt --quiet run-operation generate_source \
  --args '{"schema_name": "<schema>", "database_name": "<database>", "generate_columns": true, "include_descriptions": true, "table_names": ["<table_1>", "<table_2>"]}' \
  > models/staging/<source_dir>/<source_name>.yml
```

Details:
- `schema_name` is required; everything else is optional. Omit `table_names` to generate every table in the schema.
- `--quiet` suppresses dbt's run logs so only the macro's YAML output goes to the file. Without it you'll get log noise mixed into the file.
- If a source with this name already exists, generate to a temp file first, diff it, and merge carefully to avoid duplicate table definitions.

**Step 2: Open the file and do the judgment pass.** For each table and column, fill in:
- `description`: only what you can support from the column name, its data type, or its relationship to other columns you can see. If a column's purpose isn't inferable, leave the description empty or say so explicitly rather than guessing. An empty description is honest; an invented one is a bug you can't see.
- Tests: `not_null` / `unique` on primary-key-shaped columns (typically `id` or `<table>_id`).
- `loaded_at_field`: only if there's a clear timestamp column suggesting freshness checks (e.g. `_loaded_at`, `updated_at`).
- Foreign key relationships: only note them in prose/description if the column name makes the reference unambiguous (e.g. `customer_id`). Don't add a `relationships` test unless the user asks. That requires knowing the referenced model exists and is named correctly.

**Step 3: Validate.**

```bash
dbt parse
```

## Part 2: Staging models

**File and folder conventions** (per dbt Labs' best-practices guide: apply these regardless of what codegen names things by default):
- One subdirectory per source system under `models/staging/` (e.g. `staging/stripe/`, `staging/ecom/`). A single-source project can stay flat.
- File name pattern: `stg_[source]__[entity]s.sql` with plural entity and double underscore between source and entity when there's more than one source system. In a single-source project, `stg_orders.sql` is clear enough without the prefix.
- Materialize the whole staging directory as views (they're building blocks, not final artifacts):
  ```yaml
  # dbt_project.yml
  models:
    <project_name>:
      staging:
        +materialized: view
  ```

**Step 1: Run codegen for the SQL skeleton, piped to file.**

```bash
dbt --quiet run-operation generate_base_model \
  --args '{"source_name": "<source>", "table_name": "<table>"}' \
  > models/staging/<dir>/stg_<table>.sql
```

Optional args: `leading_commas` (default false), `materialized`, `case_sensitive_cols`.

For staging several tables from the same source at once, use `codegen.create_base_models` which writes files directly without a manual redirect. Note: it runs a bundled bash script and is **not compatible with the dbt Cloud IDE**, so only use it in a local/CLI environment:

```bash
dbt run-operation codegen.create_base_models --args '{"source_name": "<source>", "tables": ["<table_1>", "<table_2>"]}'
```

**Step 2: Refactor the generated SQL to match staging conventions**, rather than leaving the raw codegen output as-is. `generate_base_model` gives you an unqualified `select *`-style rename block with no casts and the source's raw column names. Treat that as a starting point, not the finished model. dbt Labs' guide names the standard staging transformations as renaming, type casting, basic computations, and categorizing (turning raw values into booleans or buckets). Explicitly NOT joins or aggregations: those belong downstream. Concretely:

- **Cast every column explicitly.** Don't rely on the warehouse's implicit typing. Check the actual column type from `information_schema.columns` (which `generate_source` already queried; re-run it or query directly if the type isn't visible in the generated YAML). Cast in the select, e.g. `created_at::timestamp as created_at`, `amount::numeric as amount_usd`.
- **Give ambiguous columns explicit, joinable names.** The most common offender is a bare `id` primary key. Rename it to `<singular_table>_id` (a `users` table's `id` becomes `user_id`, an `orders` table's `id` becomes `order_id`). Apply the same logic to other generic names that only make sense in the source table's context (`name` → `user_name`, `status` → `order_status`). The test: would this column name still be unambiguous if you saw it alone in a joined query three models downstream? If not, qualify it.
- **Normalize casing on string columns, but pick the case that fits the content.** Don't blanket-uppercase or lowercase everything. Proper nouns (people's names, city/place names, company names) read best in title case; codes, statuses, emails, and other machine-facing values are more useful lowercase for consistent joins/filters downstream (`lower(email) as email`); anything meant to display as a fixed label (e.g. a country code) may call for uppercase. Use the warehouse's title-case function where available (e.g. Snowflake's `initcap()`) rather than hand-rolling one.
- **Turn bad booleans into real booleans.** Source systems routinely encode true/false as `0`/`1`, `'Y'`/`'N'`, `'Yes'`/`'No'`, or similar. Cast these to an actual boolean rather than passing the raw value through, e.g. `case when is_active = 'Y' then true when is_active = 'N' then false end as is_active`. Look at the actual distinct values before assuming which convention a column uses. Don't guess the encoding.
- **Trim only where whitespace is actually a problem.** Don't reflexively wrap every string column in `trim()`. Check whether the source data actually has leading/trailing whitespace (or ask, if you can't check) before adding it. Unnecessary trims are noise that obscure which columns genuinely needed cleanup.
- Staging owns renaming, casting, and this light cleanup only. No joins, no aggregations, no business logic: those belong in intermediate models. If a join is genuinely unavoidable to stage a concept cleanly (e.g. merging a delete-tracking table), that's what `base` models are for: a sub-layer within staging, not a shortcut to skip intermediate.
- Keep the `with source as (select * from {{ source(...) }})` CTE structure codegen gives you. It's the right shape: you're filling in the `renamed` CTE's `select` list with casts, real names, and cleanup. Group related columns under a short comment header (`---------- ids`, `---------- strings`, `---------- booleans`, `---------- timestamps`). This is dbt Labs' own convention and makes a wide rename block much easier to scan.

**Step 3: Generate the staging model's own YAML skeleton the same way**, once the model compiles, so its column list is model-accurate rather than retyped from memory. One file per model (e.g., `stg_orders.yml`):

```bash
dbt --quiet run-operation generate_model_yaml \
  --args '{"model_names": ["stg_<table>"]}' \
  > models/staging/<dir>/stg_<table>.yml
```

Then apply the same judgment pass as sources (Step 2 above): descriptions and tests, evidence-based only.

**Step 4: Validate.**

```bash
dbt parse
```

## When the user just wants to review, not write to disk

If the user explicitly asks to see the codegen output before it lands in a file (e.g., reviewing a large multi-table run), read the macro's stdout into context instead of redirecting. This costs more tokens but is the right tradeoff when they want a look before committing. Otherwise, default to writing straight to the file, since that's both cheaper and matches how these macros are meant to be used (skeleton in, refine in place).
````
