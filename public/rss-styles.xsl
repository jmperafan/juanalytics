<?xml version="1.0" encoding="utf-8"?>
<xsl:stylesheet version="3.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
                xmlns:atom="http://www.w3.org/2005/Atom">
  <xsl:output method="html" version="1.0" encoding="UTF-8" indent="yes"/>
  <xsl:template match="/">
    <html xmlns="http://www.w3.org/1999/xhtml" lang="en">
      <head>
        <meta charset="UTF-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        <title><xsl:value-of select="/rss/channel/title"/> RSS Feed</title>
        <style type="text/css">
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            max-width: 800px;
            margin: 0 auto;
            padding: 2rem;
            background: #0f172a;
            color: #f9fafb;
          }
          h1 {
            color: #2563eb;
            margin-bottom: 0.5rem;
          }
          .description {
            color: #9ca3af;
            margin-bottom: 2rem;
            font-size: 1.1rem;
          }
          .subscribe-info {
            background: #1e293b;
            padding: 1.5rem;
            border-radius: 8px;
            margin-bottom: 2rem;
            border: 1px solid #334155;
          }
          .subscribe-info h2 {
            margin-top: 0;
            color: #2563eb;
          }
          .subscribe-info code {
            background: #0f172a;
            padding: 0.25rem 0.5rem;
            border-radius: 4px;
            color: #60a5fa;
          }
          .item {
            background: #1e293b;
            padding: 1.5rem;
            margin-bottom: 1.5rem;
            border-radius: 8px;
            border: 1px solid #334155;
          }
          .item h3 {
            margin-top: 0;
            margin-bottom: 0.5rem;
          }
          .item h3 a {
            color: #60a5fa;
            text-decoration: none;
          }
          .item h3 a:hover {
            text-decoration: underline;
          }
          .item-meta {
            color: #9ca3af;
            font-size: 0.9rem;
            margin-bottom: 1rem;
          }
          .item-description {
            color: #d1d5db;
          }
          .categories {
            margin-top: 1rem;
            display: flex;
            gap: 0.5rem;
            flex-wrap: wrap;
          }
          .category {
            background: #2563eb;
            color: white;
            padding: 0.25rem 0.75rem;
            border-radius: 4px;
            font-size: 0.85rem;
          }
        </style>
      </head>
      <body>
        <h1><xsl:value-of select="/rss/channel/title"/></h1>
        <p class="description"><xsl:value-of select="/rss/channel/description"/></p>

        <div class="subscribe-info">
          <h2>📡 Subscribe to this feed</h2>
          <p>This is an RSS feed. To subscribe, copy this URL into your RSS reader:</p>
          <p><code><xsl:value-of select="/rss/channel/link"/>rss.xml</code></p>
          <p>Popular RSS readers: Feedly, Inoreader, NewsBlur, The Old Reader</p>
        </div>

        <h2>Recent Posts</h2>
        <xsl:for-each select="/rss/channel/item">
          <div class="item">
            <h3>
              <a>
                <xsl:attribute name="href">
                  <xsl:value-of select="link"/>
                </xsl:attribute>
                <xsl:value-of select="title"/>
              </a>
            </h3>
            <div class="item-meta">
              Published: <xsl:value-of select="substring(pubDate, 1, 16)"/>
            </div>
            <div class="item-description">
              <xsl:value-of select="description"/>
            </div>
            <xsl:if test="category">
              <div class="categories">
                <xsl:for-each select="category">
                  <span class="category"><xsl:value-of select="."/></span>
                </xsl:for-each>
              </div>
            </xsl:if>
          </div>
        </xsl:for-each>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
