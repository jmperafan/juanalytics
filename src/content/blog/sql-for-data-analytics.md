---
title: "Book Review: SQL for Data Analytics (4th Edition)"
description: "I recently finished reading SQL for Data Analytics (4th Edition). Here are my thoughts on the book."
pubDate: 2025-11-03
heroImage: 'sql-for-data-analytics-cover.jpg'
tags: ["sql", "career development"]
---

Packt sent me an early release copy of [SQL for Data Analytics](https://www.packtpub.com/en-us/product/sql-for-data-analytics-9781836646259), a book I'd never heard of before. I am not part of the objective audience for such a book (it is probably written for people who want to become analysts). But I was intrigued since I spent most of this year teaching SQL to beginners, so I was curious about the authors' approach.

After reading the book and working through the exercises, I can confidently recommend it as a great resource for anyone learning SQL. Here's why I think it's worth checking out.

## The Good Stuff

What I really appreciated about this book is how it balances theory with hands-on practice. It's not just another "here's how to write a `SELECT` statement" tutorial. The exercises actually make you think, and the real-world context helps you understand why you'd use certain techniques, not just how.

As a SQL instructor, I know we all have different learning styles. I'm not sure there's an objectively better method, but I do know we each need to find what works for us. That's why I especially appreciate how this book caters to different types of learners. Some readers thrive on hands-on exercises, others want detailed explanations of SQL features, and some prefer understanding the business reasoning behind queries. This versatility makes the book accessible without ever feeling watered down.

One thing the book gets right is treating SQL as a tool for answering real questions, not a checklist of features. The examples line up with the kinds of problems analysts actually get asked to solve, and the authors show how to move from a vague business question to a concrete query plan. The case study helps here — it forces you to think through the data, the assumptions, and the steps needed to get a reliable answer. It feels practical, not academic.

The exercises are another strong part of the book. You’re not just shown queries; you actually write them, debug them, and iterate the way you would in a real workflow. It covers the basic plumbing too — loading data, exporting results, and connecting SQL work with Python when needed. Nothing about it is flashy, but the routine tasks are exactly what you deal with day to day, so the practice doesn’t feel wasted.

The authors also dive into advanced and specialized topics that many beginner-friendly books skip. Performance tuning, working with JSON, and even geospatial queries are all explained in a way that's approachable yet thorough.

## The Gaps

This is a 300+ page book covering a massive topic. The authors made smart choices about scope, but here are some areas where you might want to complement your learning.

Firstly, the book is written entirely with PostgreSQL in mind, but doesn't explain why (beyond its popularity). I think readers would benefit from understanding Postgres' open-source licensing, its wide adoption in both analytic and operational use cases, its extensibility through add-ons and extensions, and how modern platforms like Databricks and Snowflake are adding managed Postgres databases to their offerings.

Related to this, some readers will want to apply their learning to whatever databases they have access to. An appendix explaining common dialect differences between PostgreSQL, ANSI SQL, and other SQL flavors would be helpful.

Secondly, several interesting features have been added to PostgreSQL since the first edition. If I were teaching a SQL course using Postgres, I'd definitely mention `QUALIFY`, `DISTINCT ON`, and `FILTER`. All of these can massively simplify queries.

Thirdly, you could argue these are advanced topics, but I make a point to teach my students how to write clean SQL, how to refactor scripts, and how to validate their SQL output. A chapter on these practices would strengthen the book.

Finally, the book teaches data transformations using Python, specifically Pandas. While I wasn't expecting coverage of this topic (even though it's essential for modern analytics), and I fully understand their reasoning. Pandas is still the most popular data manipulation library in Python. Nevertheless, it's worth noting that many practitioners are migrating to Polars for its superior performance and more intuitive syntax. Honestly, if you're starting to learn Python in 2025, I'd recommend skipping Pandas altogether.

## My Take

Even with those minor gaps, SQL for Data Analytics is a solid resource. It brings together practical exercises, technical depth, and real-world examples in a way that most SQL books don't quite nail.

If you're a beginner trying to build a strong foundation, this will help. If you're an analyst looking to level up your skills, you'll find plenty of useful content.

It's clear the book is designed not just to teach SQL, but to teach you how to think analytically with SQL.
