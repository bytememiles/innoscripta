<?php

use Knuckles\Scribe\Extracting\Strategies;
return [
    /*
     * The HTML <title> for the generated documentation, and the name of the generated Postman collection.
     */
    'title' => 'News Aggregator API Documentation',

    /*
     * A short description of your API.
     */
    'description' => 'A comprehensive news aggregation API that collects and serves news articles from multiple sources including NewsAPI, NewsData.io, and The New York Times.',

    /*
     * The base URL displayed in the docs. If this is empty, Scribe will use the value of config('app.url').
     */
    'base_url' => null,

    /*
     * Generate a Postman collection (v2.1.0) in addition to HTML docs.
     * For 'static' docs, the collection will be generated to public/docs/collection.json.
     * For 'laravel' docs, it will be generated to storage/app/scribe/collection.json.
     * Setting this to false will skip Postman collection generation.
     */
    'postman' => [
        'enabled' => true,
        'overrides' => [
            // 'info.version' => '2.0.0',
        ],
    ],

    /*
     * Generate an OpenAPI spec (v3.0.1) in addition to docs webpage.
     * For 'static' docs, the collection will be generated to public/docs/openapi.yaml.
     * For 'laravel' docs, it will be generated to storage/app/scribe/openapi.yaml.
     * Setting this to false will skip OpenAPI spec generation.
     */
    'openapi' => [
        'enabled' => true,
        'overrides' => [
            // 'info.version' => '2.0.0',
        ],
    ],

    /*
     * The type of documentation output to generate.
     * - "static" will generate a static HTMl page in the /public/docs folder,
     * - "laravel" will generate the documentation as a Blade view,
     *   so you can add routing and authentication.
     */
    'type' => 'static',

    /*
     * Settings for `static` type output.
     */
    'static' => [
        /*
         * HTML documentation, assets and Postman collection will be generated to this folder.
         * Source Markdown will be generated to resources/docs.
         */
        'output_path' => 'public/docs',
    ],

    /*
     * Settings for `laravel` type output.
     */
    'laravel' => [
        /*
         * Whether to automatically create a docs endpoint for you to view your generated docs.
         * If this is false, you can still set up routing manually.
         */
        'add_routes' => true,

        /*
         * URL path to use for the docs endpoint (if `add_routes` is true).
         * By default, `/docs` will be used.
         */
        'docs_url' => '/docs',

        /*
         * Directory within `public/` where to export assets.
         * CSS, JS, and images used in your docs will go here.
         */
        'assets_directory' => 'vendor/scribe',
        
        /*
         * Middleware to wrap the docs routes with.
         * Example: ['auth', 'throttle:60,1']
         */
        'middleware' => [],
    ],

    /*
     * The routes for which documentation should be generated.
     * Each group contains rules defining which routes should be included ('include' and 'exclude' sections)
     * and rules which should be applied to them ('apply' section).
     */
    'routes' => [
        [
            /*
             * Specify conditions to determine what routes will be parsed in this group.
             * A route must fulfil ALL conditions to belong to this group.
             */
            'match' => [
                /*
                 * Match only routes whose domains match this pattern (use * as a wildcard to match any characters).
                 * Example: 'api.*' to match all routes on an 'api' subdomain.
                 */
                'domains' => ['*'],

                /*
                 * Match only routes whose paths match this pattern (use * as a wildcard to match any characters).
                 * Example: 'users/*' to match all routes that start with 'users/'.
                 */
                'prefixes' => ['api/*'],

                /*
                 * Match only routes registered under this version. This option is ignored for Laravel router.
                 * Note that wildcards are not supported.
                 */
                'versions' => ['v1'],
            ],

            /*
             * Include these routes even if they did not match the rules above.
             * The route can be referenced by name or by path.
             * Wildcards are supported.
             */
            'include' => [
                // 'users.index', 'healthcheck*'
            ],

            /*
             * Exclude these routes even if they matched the rules above.
             * The route can be referenced by name or by path.
             * Wildcards are supported.
             */
            'exclude' => [
                // 'users.create', 'admin.*'
            ],

            /*
             * Specify rules to be applied to all the routes in this group when generating documentation
             */
            'apply' => [
                /*
                 * Specify headers to be added to the example requests
                 */
                'headers' => [
                    'Content-Type' => 'application/json',
                    'Accept' => 'application/json',
                ],

                /*
                 * If no @response or @apiResourceCollection/@apiResource annotations are found for the route,
                 * we'll try to get a sample response by attempting an API call.
                 * Configure the settings for the API call here.
                 */
                'response_calls' => [
                    /*
                     * API calls will be made only for routes in this group matching these HTTP methods (GET, POST, etc).
                     * List the methods here or use '*' to mean all methods. Leave empty to disable API calls.
                     */
                    'methods' => ['GET'],

                    /*
                     * Laravel config variables which should be set for the API call.
                     * This is a good place to ensure that notifications, emails, etc. are not sent
                     * when generating docs.
                     */
                    'config' => [
                        'app.env' => 'documentation',
                        // 'app.debug' => false,
                    ],

                    /*
                     * Query parameters which should be sent with the API call.
                     */
                    'queryParams' => [
                        // 'key' => 'value',
                    ],

                    /*
                     * Body parameters which should be sent with the API call.
                     */
                    'bodyParams' => [
                        // 'key' => 'value',
                    ],

                    /*
                     * Files which should be sent with the API call.
                     * Each value should be a valid absolute path to a file on this machine.
                     */
                    'fileParams' => [
                        // 'key' => '/path/to/file',
                    ],

                    /*
                     * Cookies which should be sent with the API call.
                     */
                    'cookies' => [
                        // 'name' => 'value'
                    ],
                ],
            ],
        ],
    ],

    /*
     * Custom logo path. Will be copied to the docs folder and referenced in the docs.
     * Set to false to use the default logo.
     * Should be an absolute path, or path relative to your project root.
     */
    'logo' => false,

    /*
     * Custom text to place in the "Introduction" section, before the default text.
     * Markdown and HTML are supported.
     */
    'intro_text' => '
This API provides comprehensive news aggregation services, collecting articles from multiple trusted sources and offering features like:

- **Multi-source aggregation**: NewsAPI, NewsData.io, and The New York Times
- **Advanced filtering**: Filter by date, category, source, and keywords
- **User preferences**: Personalized news feeds based on user interests
- **Full-text search**: Search across article titles, descriptions, and content
- **Real-time updates**: Automated hourly news collection

## Authentication

Most endpoints require authentication using Laravel Sanctum tokens. After registering or logging in, include the Bearer token in the Authorization header:

```
Authorization: Bearer YOUR_TOKEN_HERE
```

## Rate Limiting

API requests are rate-limited to 60 requests per minute per IP address.
    ',

    /*
     * Generate a "Try It Out" button for each endpoint so consumers can test endpoints right from their browser.
     * Obviously, this isn't suitable if your API is not publicly accessible.
     * Each endpoint will have a button which, when clicked, tells the JavaScript to make an API call and display the response.
     * Note: If you're generating a static site, you'll need the `javascript` config to be set to `true`.
     */
    'try_it_out' => [
        'enabled' => true,
        /*
         * The base URL for the API tester to use (for example, you can set this to your staging URL).
         * Leave as null to use the current app URL (config(app.url)).
         */
        'base_url' => null,

        /*
         * Fetch a CSRF token before each request, and add it as an X-CSRF-TOKEN header. Only applies if you're using Laravel's default CSRF middleware.
         */
        'use_csrf' => false,

        // The URL to fetch the CSRF token from (if `use_csrf` is true).
        'csrf_url' => '/sanctum/csrf-cookie',
    ],

    /*
     * For response calls, API resource responses and transformer responses,
     * Scribe will try to generate examples of your API responses by creating instances of your models and calling the appropriate methods.
     * By default, Scribe will try a few strategies, then give up if it can't generate a good example.
     * You can use this setting to be more specific about how Scribe should generate example models.
     * Each key is a model class, and each value should be a factory name or callable.
     */
    'database_connections_to_transact' => [config('database.default')],
    // See https://scribe.knuckles.wtf/laravel/reference/config#theme for supported options
    'theme' => 'default',
    'external' => ['html_attributes' => []],
    // How is your API authenticated? This information will be used in the displayed docs, generated examples and response calls.
    'auth' => [
        // Set this to true if ANY endpoints in your API use authentication.
        'enabled' => false,
        // Set this to true if your API should be authenticated by default. If so, you must also set `enabled` (above) to true.
        // You can then use @unauthenticated or @authenticated on individual endpoints to change their status from the default.
        'default' => false,
        // Where is the auth value meant to be sent in a request?
        // Options: query, body, basic, bearer, header (for custom header)
        'in' => 'bearer',
        // The name of the auth parameter (e.g. token, key, apiKey) or header (e.g. Authorization, Api-Key).
        'name' => 'key',
        // The value of the parameter to be used by Scribe to authenticate response calls.
        // This will NOT be included in the generated documentation. If empty, Scribe will use a random value.
        'use_value' => env('SCRIBE_AUTH_KEY'),
        // Placeholder your users will see for the auth parameter in the example requests.
        // Set this to null if you want Scribe to use a random value as placeholder instead.
        'placeholder' => '{YOUR_AUTH_KEY}',
        // Any extra authentication-related info for your users. Markdown and HTML are supported.
        'extra_info' => 'You can retrieve your token by visiting your dashboard and clicking <b>Generate API token</b>.',
    ],
    // Customize the "Last updated" value displayed in the docs by specifying tokens and formats.
    // Examples:
    // - {date:F j Y} => March 28, 2022
    // - {git:short} => Short hash of the last Git commit
    // Available tokens are `{date:<format>}` and `{git:<format>}`.
    // The format you pass to `date` will be passed to PHP's `date()` function.
    // The format you pass to `git` can be either "short" or "long".
    'last_updated' => 'Last updated: {date:F j, Y}',
    'examples' => [
        // Set this to any number (e.g. 1234) to generate the same example values for parameters on each run,
        'faker_seed' => null,
        // With API resources and transformers, Scribe tries to generate example models to use in your API responses.
        // By default, Scribe will try the model's factory, and if that fails, try fetching the first from the database.
        // You can reorder or remove strategies here.
        'models_source' => ['factoryCreate', 'factoryMake', 'databaseFirst'],
    ],
    'fractal' => [
        // If you are using a custom serializer with league/fractal, you can specify it here.
        'serializer' => null,
    ],
    'routeMatcher' => \Knuckles\Scribe\Matching\RouteMatcher::class,
];