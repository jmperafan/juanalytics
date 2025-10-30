declare module 'astro:content' {
	interface Render {
		'.mdx': Promise<{
			Content: import('astro').MarkdownInstance<{}>['Content'];
			headings: import('astro').MarkdownHeading[];
			remarkPluginFrontmatter: Record<string, any>;
			components: import('astro').MDXInstance<{}>['components'];
		}>;
	}
}

declare module 'astro:content' {
	interface RenderResult {
		Content: import('astro/runtime/server/index.js').AstroComponentFactory;
		headings: import('astro').MarkdownHeading[];
		remarkPluginFrontmatter: Record<string, any>;
	}
	interface Render {
		'.md': Promise<RenderResult>;
	}

	export interface RenderedContent {
		html: string;
		metadata?: {
			imagePaths: Array<string>;
			[key: string]: unknown;
		};
	}
}

declare module 'astro:content' {
	type Flatten<T> = T extends { [K: string]: infer U } ? U : never;

	export type CollectionKey = keyof AnyEntryMap;
	export type CollectionEntry<C extends CollectionKey> = Flatten<AnyEntryMap[C]>;

	export type ContentCollectionKey = keyof ContentEntryMap;
	export type DataCollectionKey = keyof DataEntryMap;

	type AllValuesOf<T> = T extends any ? T[keyof T] : never;
	type ValidContentEntrySlug<C extends keyof ContentEntryMap> = AllValuesOf<
		ContentEntryMap[C]
	>['slug'];

	/** @deprecated Use `getEntry` instead. */
	export function getEntryBySlug<
		C extends keyof ContentEntryMap,
		E extends ValidContentEntrySlug<C> | (string & {}),
	>(
		collection: C,
		// Note that this has to accept a regular string too, for SSR
		entrySlug: E,
	): E extends ValidContentEntrySlug<C>
		? Promise<CollectionEntry<C>>
		: Promise<CollectionEntry<C> | undefined>;

	/** @deprecated Use `getEntry` instead. */
	export function getDataEntryById<C extends keyof DataEntryMap, E extends keyof DataEntryMap[C]>(
		collection: C,
		entryId: E,
	): Promise<CollectionEntry<C>>;

	export function getCollection<C extends keyof AnyEntryMap, E extends CollectionEntry<C>>(
		collection: C,
		filter?: (entry: CollectionEntry<C>) => entry is E,
	): Promise<E[]>;
	export function getCollection<C extends keyof AnyEntryMap>(
		collection: C,
		filter?: (entry: CollectionEntry<C>) => unknown,
	): Promise<CollectionEntry<C>[]>;

	export function getEntry<
		C extends keyof ContentEntryMap,
		E extends ValidContentEntrySlug<C> | (string & {}),
	>(entry: {
		collection: C;
		slug: E;
	}): E extends ValidContentEntrySlug<C>
		? Promise<CollectionEntry<C>>
		: Promise<CollectionEntry<C> | undefined>;
	export function getEntry<
		C extends keyof DataEntryMap,
		E extends keyof DataEntryMap[C] | (string & {}),
	>(entry: {
		collection: C;
		id: E;
	}): E extends keyof DataEntryMap[C]
		? Promise<DataEntryMap[C][E]>
		: Promise<CollectionEntry<C> | undefined>;
	export function getEntry<
		C extends keyof ContentEntryMap,
		E extends ValidContentEntrySlug<C> | (string & {}),
	>(
		collection: C,
		slug: E,
	): E extends ValidContentEntrySlug<C>
		? Promise<CollectionEntry<C>>
		: Promise<CollectionEntry<C> | undefined>;
	export function getEntry<
		C extends keyof DataEntryMap,
		E extends keyof DataEntryMap[C] | (string & {}),
	>(
		collection: C,
		id: E,
	): E extends keyof DataEntryMap[C]
		? Promise<DataEntryMap[C][E]>
		: Promise<CollectionEntry<C> | undefined>;

	/** Resolve an array of entry references from the same collection */
	export function getEntries<C extends keyof ContentEntryMap>(
		entries: {
			collection: C;
			slug: ValidContentEntrySlug<C>;
		}[],
	): Promise<CollectionEntry<C>[]>;
	export function getEntries<C extends keyof DataEntryMap>(
		entries: {
			collection: C;
			id: keyof DataEntryMap[C];
		}[],
	): Promise<CollectionEntry<C>[]>;

	export function render<C extends keyof AnyEntryMap>(
		entry: AnyEntryMap[C][string],
	): Promise<RenderResult>;

	export function reference<C extends keyof AnyEntryMap>(
		collection: C,
	): import('astro/zod').ZodEffects<
		import('astro/zod').ZodString,
		C extends keyof ContentEntryMap
			? {
					collection: C;
					slug: ValidContentEntrySlug<C>;
				}
			: {
					collection: C;
					id: keyof DataEntryMap[C];
				}
	>;
	// Allow generic `string` to avoid excessive type errors in the config
	// if `dev` is not running to update as you edit.
	// Invalid collection names will be caught at build time.
	export function reference<C extends string>(
		collection: C,
	): import('astro/zod').ZodEffects<import('astro/zod').ZodString, never>;

	type ReturnTypeOrOriginal<T> = T extends (...args: any[]) => infer R ? R : T;
	type InferEntrySchema<C extends keyof AnyEntryMap> = import('astro/zod').infer<
		ReturnTypeOrOriginal<Required<ContentConfig['collections'][C]>['schema']>
	>;

	type ContentEntryMap = {
		"blog": {
"fundamentals-analytics-engineering.md": {
	id: "fundamentals-analytics-engineering.md";
  slug: "fundamentals-analytics-engineering";
  body: string;
  collection: "blog";
  data: any
} & { render(): Render[".md"] };
"welcome.md": {
	id: "welcome.md";
  slug: "welcome";
  body: string;
  collection: "blog";
  data: any
} & { render(): Render[".md"] };
};
"books": {
"fundamentals-analytics-engineering.md": {
	id: "fundamentals-analytics-engineering.md";
  slug: "fundamentals-analytics-engineering";
  body: string;
  collection: "books";
  data: any
} & { render(): Render[".md"] };
};
"podcasts": {
"beyond-coding-2021.md": {
	id: "beyond-coding-2021.md";
  slug: "beyond-coding-2021";
  body: string;
  collection: "podcasts";
  data: any
} & { render(): Render[".md"] };
"data-career-transformation-2025.md": {
	id: "data-career-transformation-2025.md";
  slug: "data-career-transformation-2025";
  body: string;
  collection: "podcasts";
  data: any
} & { render(): Render[".md"] };
"data-career-transformations.md": {
	id: "data-career-transformations.md";
  slug: "data-career-transformations";
  body: string;
  collection: "podcasts";
  data: any
} & { render(): Render[".md"] };
"data-engineering-podcast-2021.md": {
	id: "data-engineering-podcast-2021.md";
  slug: "data-engineering-podcast-2021";
  body: string;
  collection: "podcasts";
  data: any
} & { render(): Render[".md"] };
"episode-01.md": {
	id: "episode-01.md";
  slug: "episode-01";
  body: string;
  collection: "podcasts";
  data: any
} & { render(): Render[".md"] };
"episode-02.md": {
	id: "episode-02.md";
  slug: "episode-02";
  body: string;
  collection: "podcasts";
  data: any
} & { render(): Render[".md"] };
"episode-03.md": {
	id: "episode-03.md";
  slug: "episode-03";
  body: string;
  collection: "podcasts";
  data: any
} & { render(): Render[".md"] };
"episode-04.md": {
	id: "episode-04.md";
  slug: "episode-04";
  body: string;
  collection: "podcasts";
  data: any
} & { render(): Render[".md"] };
"episode-05.md": {
	id: "episode-05.md";
  slug: "episode-05";
  body: string;
  collection: "podcasts";
  data: any
} & { render(): Render[".md"] };
"episode-06.md": {
	id: "episode-06.md";
  slug: "episode-06";
  body: string;
  collection: "podcasts";
  data: any
} & { render(): Render[".md"] };
"episode-07.md": {
	id: "episode-07.md";
  slug: "episode-07";
  body: string;
  collection: "podcasts";
  data: any
} & { render(): Render[".md"] };
"episode-08.md": {
	id: "episode-08.md";
  slug: "episode-08";
  body: string;
  collection: "podcasts";
  data: any
} & { render(): Render[".md"] };
"episode-09.md": {
	id: "episode-09.md";
  slug: "episode-09";
  body: string;
  collection: "podcasts";
  data: any
} & { render(): Render[".md"] };
"episode-10.md": {
	id: "episode-10.md";
  slug: "episode-10";
  body: string;
  collection: "podcasts";
  data: any
} & { render(): Render[".md"] };
"episode-11.md": {
	id: "episode-11.md";
  slug: "episode-11";
  body: string;
  collection: "podcasts";
  data: any
} & { render(): Render[".md"] };
"episode-12.md": {
	id: "episode-12.md";
  slug: "episode-12";
  body: string;
  collection: "podcasts";
  data: any
} & { render(): Render[".md"] };
"episode-13.md": {
	id: "episode-13.md";
  slug: "episode-13";
  body: string;
  collection: "podcasts";
  data: any
} & { render(): Render[".md"] };
"episode-14.md": {
	id: "episode-14.md";
  slug: "episode-14";
  body: string;
  collection: "podcasts";
  data: any
} & { render(): Render[".md"] };
"episode-15.md": {
	id: "episode-15.md";
  slug: "episode-15";
  body: string;
  collection: "podcasts";
  data: any
} & { render(): Render[".md"] };
"episode-16.md": {
	id: "episode-16.md";
  slug: "episode-16";
  body: string;
  collection: "podcasts";
  data: any
} & { render(): Render[".md"] };
"episode-17.md": {
	id: "episode-17.md";
  slug: "episode-17";
  body: string;
  collection: "podcasts";
  data: any
} & { render(): Render[".md"] };
"la-nueva-generacion-marketera-2024.md": {
	id: "la-nueva-generacion-marketera-2024.md";
  slug: "la-nueva-generacion-marketera-2024";
  body: string;
  collection: "podcasts";
  data: any
} & { render(): Render[".md"] };
};
"talks": {
"amsterdam-nerdnite-2017.md": {
	id: "amsterdam-nerdnite-2017.md";
  slug: "amsterdam-nerdnite-2017";
  body: string;
  collection: "talks";
  data: any
} & { render(): Render[".md"] };
"analytics-engineering-meetup-2023.md": {
	id: "analytics-engineering-meetup-2023.md";
  slug: "analytics-engineering-meetup-2023";
  body: string;
  collection: "talks";
  data: any
} & { render(): Render[".md"] };
"big-data-expo-2022.md": {
	id: "big-data-expo-2022.md";
  slug: "big-data-expo-2022";
  body: string;
  collection: "talks";
  data: any
} & { render(): Render[".md"] };
"big-data-summit-warsaw-2022.md": {
	id: "big-data-summit-warsaw-2022.md";
  slug: "big-data-summit-warsaw-2022";
  body: string;
  collection: "talks";
  data: any
} & { render(): Render[".md"] };
"budapest-dbt-meetup-2024.md": {
	id: "budapest-dbt-meetup-2024.md";
  slug: "budapest-dbt-meetup-2024";
  body: string;
  collection: "talks";
  data: any
} & { render(): Render[".md"] };
"coalesce-2023.md": {
	id: "coalesce-2023.md";
  slug: "coalesce-2023";
  body: string;
  collection: "talks";
  data: any
} & { render(): Render[".md"] };
"coalesce-2025.md": {
	id: "coalesce-2025.md";
  slug: "coalesce-2025";
  body: string;
  collection: "talks";
  data: any
} & { render(): Render[".md"] };
"dbt-global-circuit-2025.md": {
	id: "dbt-global-circuit-2025.md";
  slug: "dbt-global-circuit-2025";
  body: string;
  collection: "talks";
  data: any
} & { render(): Render[".md"] };
"dbt-meetup-berlin-2025.md": {
	id: "dbt-meetup-berlin-2025.md";
  slug: "dbt-meetup-berlin-2025";
  body: string;
  collection: "talks";
  data: any
} & { render(): Render[".md"] };
"developerweek-latam-2023.md": {
	id: "developerweek-latam-2023.md";
  slug: "developerweek-latam-2023";
  body: string;
  collection: "talks";
  data: any
} & { render(): Render[".md"] };
"godatafest-2022.md": {
	id: "godatafest-2022.md";
  slug: "godatafest-2022";
  body: string;
  collection: "talks";
  data: any
} & { render(): Render[".md"] };
"godatafest-2023.md": {
	id: "godatafest-2023.md";
  slug: "godatafest-2023";
  body: string;
  collection: "talks";
  data: any
} & { render(): Render[".md"] };
"godatafest-lite-2023.md": {
	id: "godatafest-lite-2023.md";
  slug: "godatafest-lite-2023";
  body: string;
  collection: "talks";
  data: any
} & { render(): Render[".md"] };
"snowflake-user-group-netherlands-2025.md": {
	id: "snowflake-user-group-netherlands-2025.md";
  slug: "snowflake-user-group-netherlands-2025";
  body: string;
  collection: "talks";
  data: any
} & { render(): Render[".md"] };
"tech-talks-antwerpen-2019.md": {
	id: "tech-talks-antwerpen-2019.md";
  slug: "tech-talks-antwerpen-2019";
  body: string;
  collection: "talks";
  data: any
} & { render(): Render[".md"] };
};
"videos": {
"belgium-dbt-meetup-2023.md": {
	id: "belgium-dbt-meetup-2023.md";
  slug: "belgium-dbt-meetup-2023";
  body: string;
  collection: "videos";
  data: any
} & { render(): Render[".md"] };
"big-data-warsaw-2023.md": {
	id: "big-data-warsaw-2023.md";
  slug: "big-data-warsaw-2023";
  body: string;
  collection: "videos";
  data: any
} & { render(): Render[".md"] };
"data-governance-analytics-engineering.md": {
	id: "data-governance-analytics-engineering.md";
  slug: "data-governance-analytics-engineering";
  body: string;
  collection: "videos";
  data: any
} & { render(): Render[".md"] };
"dbt-excel.md": {
	id: "dbt-excel.md";
  slug: "dbt-excel";
  body: string;
  collection: "videos";
  data: any
} & { render(): Render[".md"] };
"dbt-tutorial-getting-started.md": {
	id: "dbt-tutorial-getting-started.md";
  slug: "dbt-tutorial-getting-started";
  body: string;
  collection: "videos";
  data: any
} & { render(): Render[".md"] };
"gdd-webinar-2022.md": {
	id: "gdd-webinar-2022.md";
  slug: "gdd-webinar-2022";
  body: string;
  collection: "videos";
  data: any
} & { render(): Render[".md"] };
"godatafest-2020.md": {
	id: "godatafest-2020.md";
  slug: "godatafest-2020";
  body: string;
  collection: "videos";
  data: any
} & { render(): Render[".md"] };
"godatafest-2021.md": {
	id: "godatafest-2021.md";
  slug: "godatafest-2021";
  body: string;
  collection: "videos";
  data: any
} & { render(): Render[".md"] };
"latinx-tableau-ug-2021.md": {
	id: "latinx-tableau-ug-2021.md";
  slug: "latinx-tableau-ug-2021";
  body: string;
  collection: "videos";
  data: any
} & { render(): Render[".md"] };
"netherlands-tableau-ug-2020.md": {
	id: "netherlands-tableau-ug-2020.md";
  slug: "netherlands-tableau-ug-2020";
  body: string;
  collection: "videos";
  data: any
} & { render(): Render[".md"] };
"open-source-summit-europe-2023.md": {
	id: "open-source-summit-europe-2023.md";
  slug: "open-source-summit-europe-2023";
  body: string;
  collection: "videos";
  data: any
} & { render(): Render[".md"] };
"power-bi-r-visuals.md": {
	id: "power-bi-r-visuals.md";
  slug: "power-bi-r-visuals";
  body: string;
  collection: "videos";
  data: any
} & { render(): Render[".md"] };
"tableau-webinar-2018.md": {
	id: "tableau-webinar-2018.md";
  slug: "tableau-webinar-2018";
  body: string;
  collection: "videos";
  data: any
} & { render(): Render[".md"] };
"tedxke-2022.md": {
	id: "tedxke-2022.md";
  slug: "tedxke-2022";
  body: string;
  collection: "videos";
  data: any
} & { render(): Render[".md"] };
};

	};

	type DataEntryMap = {
		
	};

	type AnyEntryMap = ContentEntryMap & DataEntryMap;

	export type ContentConfig = never;
}
