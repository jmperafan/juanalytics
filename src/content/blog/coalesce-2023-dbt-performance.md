---
title: 'My Talk at Coalesce 2023: dbt Performance Tips'
description: 'Sharing concrete, dbt-specific tips to improve model performance from my presentation at Coalesce 2023.'
pubDate: 2023-10-15
tags: ['dbt', 'coalesce', 'performance', 'conference']
---

# dbt Performance Tips from Coalesce 2023

I had the privilege of speaking at Coalesce 2023, where I shared concrete, dbt-specific tips to improve the performance of your models.

## The Challenge

As dbt projects grow, performance becomes increasingly important. Long-running transformations can slow down your entire analytics workflow and impact business decisions.

## Key Takeaways

Here are some of the performance optimization strategies I covered:

### 1. Incremental Models Done Right
- Understanding when to use incremental models vs. full refreshes
- Proper use of `is_incremental()` macro
- Handling late-arriving data

### 2. Materialization Strategy
- Choosing the right materialization (table, view, incremental, ephemeral)
- Understanding the trade-offs
- When to use materialized views (if your warehouse supports them)

### 3. Query Optimization
- Reducing unnecessary joins
- Proper use of CTEs vs. subqueries
- Leveraging warehouse-specific features

### 4. Testing Performance Impact
- Measuring execution time
- Using dbt artifacts to track performance
- Setting up performance benchmarks

## Community Feedback

The response from the community was incredible! Many attendees shared their own optimization wins and challenges, which sparked great discussions about real-world scenarios.

## Resources

- [Coalesce Conference](https://coalesce.getdbt.com/)
- [dbt Performance Docs](https://docs.getdbt.com/docs/build/incremental-models)

## Want to Learn More?

Join us at the [Amsterdam dbt Meetup](https://www.meetup.com/amsterdam-dbt-meetup/) where we regularly discuss dbt best practices, performance optimization, and more!

---

Have questions about dbt performance? Feel free to reach out on [LinkedIn](https://www.linkedin.com/in/jmperafan/)!
