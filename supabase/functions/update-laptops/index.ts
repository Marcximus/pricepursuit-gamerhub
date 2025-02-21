import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface OxylabsResponse {
  results: Array<{
    content: {
      title?: string;
      price?: string | null;
      ratings?: string;
      reviews?: string;
      brand?: string;
      model_name?: string;
      screen_size?: string;
      hard_disk_size?: string;
      cpu_model?: string;
      ram_memory_installed_size?: string;
      graphics_card_description?: string;
      graphics_coprocessor?: string;
      operating_system?: string;
      parse_status_code?: number;
    };
    status_code: number;
  }>;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { count, force_refresh = false } = await req.json()
    console.log(`Processing update request for ${count} laptops, force refresh: ${force_refresh}`)

    const query = supabaseClient
      .from('products')
      .select('*')
      .eq('is_laptop', true)
      .is('update_status', 'in_progress')

    const { data: laptopsToUpdate, error: fetchError } = await query

    if (fetchError) {
      throw new Error(`Failed to fetch laptops: ${fetchError.message}`)
    }

    if (!laptopsToUpdate || laptopsToUpdate.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No laptops to update' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`Found ${laptopsToUpdate.length} laptops to update`)

    const oxylabsUsername = Deno.env.get('OXYLABS_USERNAME')
    const oxylabsPassword = Deno.env.get('OXYLABS_PASSWORD')

    if (!oxylabsUsername || !oxylabsPassword) {
      throw new Error('Missing Oxylabs credentials')
    }

    const parsedLaptops = await Promise.all(
      laptopsToUpdate.map(async (laptop) => {
        try {
          console.log(`Fetching data for laptop ASIN: ${laptop.asin}`)

          const response = await fetch('https://realtime.oxylabs.io/v1/queries', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Basic ${btoa(`${oxylabsUsername}:${oxylabsPassword}`)}`
            },
            body: JSON.stringify({
              source: 'amazon_product',
              query: laptop.asin,
              parse: true,
              parsing_instructions: {
                title: {
                  _fns: [
                    {
                      _fn: 'xpath_one',
                      _args: ['//span[@id="productTitle"]/text()', '//div[@id="title_feature_div"]/div/h1/span/text()']
                    },
                    {
                      _fn: 'regex_search',
                      _args: ['^\\s*(.[\s\S]*?)\\s*$', 1]
                    }
                  ]
                },
                price: {
                  _fns: [
                    {
                      _fn: 'xpath_one',
                      _args: [
                        '//div[@data-feature-name="corePrice"]/div/div/span[1]/text()',
                        '//div[@id="corePrice_feature_div"]/div/div/span[1]/text()'
                      ]
                    },
                    {
                      _fn: 'regex_search',
                      _args: ['^\\s*(.[\s\S]*?)\\s*$', 1]
                    }
                  ]
                },
                reviews: {
                  _fns: [
                    {
                      _fn: 'xpath_one',
                      _args: [
                        '//div[@id="centerCol"]/div[3]/div/span[3]/a/span/text()',
                        '//div[@class="centerColAlign"]/div[3]/div/span[3]/a/span/text()',
                        '//div[@data-csa-c-type="widget"]/div/span[3]/a/span/text()',
                        '//div[@data-csa-c-slot-id="averageCustomerReviews_feature_div"]/div/span[3]/a/span/text()',
                        '//div[@data-feature-name="averageCustomerReviews"]/div/span[3]/a/span/text()',
                        '//div[@data-csa-c-asin="B08ZLGW774"]/div/span[3]/a/span/text()',
                        '//div[@data-csa-c-is-in-initial-active-row="false"]/div/span[3]/a/span/text()',
                        '//div[@data-csa-c-content-id="averageCustomerReviews"]/div/span[3]/a/span/text()',
                        '//div[@id="averageCustomerReviews_feature_div"]/div/span[3]/a/span/text()',
                        '//div[@class="celwidget"]/div/span[3]/a/span/text()',
                        '/html/body/div[1]/div/div/div[4]/div[4]/div[3]/div/span[3]/a/span/text()'
                      ]
                    },
                    {
                      _fn: 'regex_search',
                      _args: ['^\\s*(.[\s\\S]*?)\\s*$', 1]
                    }
                  ]
                },
                ratings: {
                  _fns: [
                    {
                      _fn: 'xpath_one',
                      _args: [
                        '//div[@data-feature-name="averageCustomerReviews"]/div/span[1]/span/span[1]/a/i[1]/span/text()',
                        '//div[@data-csa-c-is-in-initial-active-row="false"]/div/span[1]/span/span[1]/a/i[1]/span/text()',
                        '//div[@id="averageCustomerReviews_feature_div"]/div/span[1]/span/span[1]/a/i[1]/span/text()',
                        '//div[@data-csa-c-asin="B08ZLGW774"]/div/span[1]/span/span[1]/a/i[1]/span/text()',
                        '//div[@class="centerColAlign"]/div[3]/div/span[1]/span/span[1]/a/i[1]/span/text()',
                        '//div[@data-csa-c-type="widget"]/div/span[1]/span/span[1]/a/i[1]/span/text()',
                        '//div[@id="centerCol"]/div[3]/div/span[1]/span/span[1]/a/i[1]/span/text()',
                        '//div[@data-csa-c-slot-id="averageCustomerReviews_feature_div"]/div/span[1]/span/span[1]/a/i[1]/span/text()',
                        '//div[@class="celwidget"]/div/span[1]/span/span[1]/a/i[1]/span/text()',
                        '//div[@data-csa-c-content-id="averageCustomerReviews"]/div/span[1]/span/span[1]/a/i[1]/span/text()',
                        '/html/body/div[1]/div/div/div[4]/div[4]/div[3]/div/span[1]/span/span[1]/a/i[1]/span/text()'
                      ]
                    },
                    {
                      _fn: 'regex_search',
                      _args: ['^\\s*(.[\s\\S]*?)\\s*$', 1]
                    }
                  ]
                },
                brand: {
                  _fns: [
                    {
                      _fn: 'xpath_one',
                      _args: [
                        '//table[@class="a-normal a-spacing-micro"]/tr[1]/td[2]/span/text()',
                        '//div[@class="a-section a-spacing-small a-spacing-top-small"]/table/tr[1]/td[2]/span/text()',
                        '//div[@data-a-expander-name="product_overview"]/div[1]/div/table/tr[1]/td[2]/span/text()',
                        '//div[@class="a-expander-content a-expander-partial-collapse-content"]/div/table/tr[1]/td[2]/span/text()',
                        '//div[@id="productOverview_feature_div"]/div/div[1]/div/table/tr[1]/td[2]/span/text()',
                        '//tr[@class="a-spacing-small po-brand"]/td[2]/span/text()',
                        '//div[@class="a-expander-collapsed-height a-row a-expander-container a-spacing-none a-expander-partial-collapse-container"]/div[1]/div/table/tr[1]/td[2]/span/text()',
                        '//div[@class="celwidget"]/div/div[1]/div/table/tr[1]/td[2]/span/text()',
                        '//div[@data-expanded="false"]/div/table/tr[1]/td[2]/span/text()',
                        '//div[@id="poExpander"]/div[1]/div/table/tr[1]/td[2]/span/text()',
                        '/html/body/div[1]/div/div/div[4]/div[4]/div[43]/div/div[1]/div/table/tr[1]/td[2]/span/text()'
                      ]
                    },
                    {
                      _fn: 'regex_search',
                      _args: ['^\\s*(.[\s\\S]*?)\\s*$', 1]
                    }
                  ]
                },
                model_name: {
                  _fns: [
                    {
                      _fn: 'xpath_one',
                      _args: [
                        '//div[@id="poExpander"]/div[1]/div/table/tr[2]/td[2]/span/text()',
                        '//tr[@class="a-spacing-small po-model_name"]/td[2]/span/text()',
                        '//div[@class="a-expander-content a-expander-partial-collapse-content"]/div/table/tr[2]/td[2]/span/text()',
                        '//div[@class="a-expander-collapsed-height a-row a-expander-container a-spacing-none a-expander-partial-collapse-container"]/div[1]/div/table/tr[2]/td[2]/span/text()',
                        '//table[@class="a-normal a-spacing-micro"]/tr[2]/td[2]/span/text()',
                        '//div[@class="a-section a-spacing-small a-spacing-top-small"]/table/tr[2]/td[2]/span/text()',
                        '//div[@data-expanded="false"]/div/table/tr[2]/td[2]/span/text()',
                        '//div[@id="productOverview_feature_div"]/div/div[1]/div/table/tr[2]/td[2]/span/text()',
                        '//div[@class="celwidget"]/div/div[1]/div/table/tr[2]/td[2]/span/text()',
                        '//div[@data-a-expander-name="product_overview"]/div[1]/div/table/tr[2]/td[2]/span/text()',
                        '/html/body/div[1]/div/div/div[4]/div[4]/div[43]/div/div[1]/div/table/tr[2]/td[2]/span/text()'
                      ]
                    },
                    {
                      _fn: 'regex_search',
                      _args: ['^\\s*(.[\s\\S]*?)\\s*$', 1]
                    }
                  ]
                },
                screen_size: {
                  _fns: [
                    {
                      _fn: 'xpath_one',
                      _args: [
                        '//div[@class="a-expander-content a-expander-partial-collapse-content"]/div/table/tr[3]/td[2]/span/text()',
                        '//div[@class="a-section a-spacing-small a-spacing-top-small"]/table/tr[3]/td[2]/span/text()',
                        '//table[@class="a-normal a-spacing-micro"]/tr[3]/td[2]/span/text()',
                        '//tr[@class="a-spacing-small po-display.size"]/td[2]/span/text()',
                        '//div[@class="a-expander-collapsed-height a-row a-expander-container a-spacing-none a-expander-partial-collapse-container"]/div[1]/div/table/tr[3]/td[2]/span/text()',
                        '//div[@data-a-expander-name="product_overview"]/div[1]/div/table/tr[3]/td[2]/span/text()',
                        '//div[@id="productOverview_feature_div"]/div/div[1]/div/table/tr[3]/td[2]/span/text()',
                        '//div[@class="celwidget"]/div/div[1]/div/table/tr[3]/td[2]/span/text()',
                        '//div[@data-expanded="false"]/div/table/tr[3]/td[2]/span/text()',
                        '//div[@id="poExpander"]/div[1]/div/table/tr[3]/td[2]/span/text()',
                        '/html/body/div[1]/div/div/div[4]/div[4]/div[43]/div/div[1]/div/table/tr[3]/td[2]/span/text()'
                      ]
                    },
                    {
                      _fn: 'regex_search',
                      _args: ['^\\s*(.[\s\\S]*?)\\s*$', 1]
                    }
                  ]
                },
                color: {
                  _fns: [
                    {
                      _fn: 'xpath_one',
                      _args: [
                        '//table[@class="a-normal a-spacing-micro"]/tr[4]/td[2]/span/text()',
                        '//div[@class="a-expander-collapsed-height a-row a-expander-container a-spacing-none a-expander-partial-collapse-container"]/div[1]/div/table/tr[4]/td[2]/span/text()',
                        '//div[@class="a-section a-spacing-small a-spacing-top-small"]/table/tr[4]/td[2]/span/text()',
                        '//tr[@class="a-spacing-small po-color"]/td[2]/span/text()',
                        '//div[@id="poExpander"]/div[1]/div/table/tr[4]/td[2]/span/text()',
                        '//div[@data-expanded="false"]/div/table/tr[4]/td[2]/span/text()',
                        '//div[@data-a-expander-name="product_overview"]/div[1]/div/table/tr[4]/td[2]/span/text()',
                        '//div[@class="a-expander-content a-expander-partial-collapse-content"]/div/table/tr[4]/td[2]/span/text()',
                        '//div[@class="celwidget"]/div/div[1]/div/table/tr[4]/td[2]/span/text()',
                        '//div[@id="productOverview_feature_div"]/div/div[1]/div/table/tr[4]/td[2]/span/text()',
                        '/html/body/div[1]/div/div/div[4]/div[4]/div[43]/div/div[1]/div/table/tr[4]/td[2]/span/text()'
                      ]
                    },
                    {
                      _fn: 'regex_search',
                      _args: ['^\\s*(.[\s\\S]*?)\\s*$', 1]
                    }
                  ]
                },
                hard_disk_size: {
                  _fns: [
                    {
                      _fn: 'xpath_one',
                      _args: [
                        '//tr[@class="a-spacing-small po-hard_disk.size"]/td[2]/span/text()',
                        '//table[@class="a-normal a-spacing-micro"]/tr[5]/td[2]/span/text()',
                        '//div[@data-a-expander-name="product_overview"]/div[1]/div/table/tr[5]/td[2]/span/text()',
                        '//div[@class="a-section a-spacing-small a-spacing-top-small"]/table/tr[5]/td[2]/span/text()',
                        '//div[@data-expanded="false"]/div/table/tr[5]/td[2]/span/text()',
                        '//div[@class="celwidget"]/div/div[1]/div/table/tr[5]/td[2]/span/text()',
                        '//div[@class="a-expander-collapsed-height a-row a-expander-container a-spacing-none a-expander-partial-collapse-container"]/div[1]/div/table/tr[5]/td[2]/span/text()',
                        '//div[@class="a-expander-content a-expander-partial-collapse-content"]/div/table/tr[5]/td[2]/span/text()',
                        '//div[@id="poExpander"]/div[1]/div/table/tr[5]/td[2]/span/text()',
                        '//div[@id="productOverview_feature_div"]/div/div[1]/div/table/tr[5]/td[2]/span/text()',
                        '/html/body/div[1]/div/div/div[4]/div[4]/div[43]/div/div[1]/div/table/tr[5]/td[2]/span/text()'
                      ]
                    },
                    {
                      _fn: 'regex_search',
                      _args: ['^\\s*(.[\s\\S]*?)\\s*$', 1]
                    }
                  ]
                },
                cpu_model: {
                  _fns: [
                    {
                      _fn: 'xpath_one',
                      _args: [
                        '//div[@id="poExpander"]/div[1]/div/table/tr[6]/td[2]/span/text()',
                        '//div[@class="a-expander-content a-expander-partial-collapse-content"]/div/table/tr[6]/td[2]/span/text()',
                        '//div[@class="celwidget"]/div/div[1]/div/table/tr[6]/td[2]/span/text()',
                        '//div[@data-a-expander-name="product_overview"]/div[1]/div/table/tr[6]/td[2]/span/text()',
                        '//div[@class="a-section a-spacing-small a-spacing-top-small"]/table/tr[6]/td[2]/span/text()',
                        '//div[@id="productOverview_feature_div"]/div/div[1]/div/table/tr[6]/td[2]/span/text()',
                        '//div[@data-expanded="false"]/div/table/tr[6]/td[2]/span/text()',
                        '//div[@class="a-expander-collapsed-height a-row a-expander-container a-spacing-none a-expander-partial-collapse-container"]/div[1]/div/table/tr[6]/td[2]/span/text()',
                        '//table[@class="a-normal a-spacing-micro"]/tr[6]/td[2]/span/text()',
                        '//tr[@class="a-spacing-small po-cpu_model.family"]/td[2]/span/text()',
                        '/html/body/div[1]/div/div/div[4]/div[4]/div[43]/div/div[1]/div/table/tr[6]/td[2]/span/text()'
                      ]
                    },
                    {
                      _fn: 'regex_search',
                      _args: ['^\\s*(.[\s\\S]*?)\\s*$', 1]
                    }
                  ]
                },
                ram_memory_installed_size: {
                  _fns: [
                    {
                      _fn: 'xpath_one',
                      _args: [
                        '//tr[@class="a-spacing-small po-ram_memory.installed_size"]/td[2]/span/text()',
                        '//table[@class="a-normal a-spacing-micro"]/tr[7]/td[2]/span/text()',
                        '//div[@data-expanded="false"]/div/table/tr[7]/td[2]/span/text()',
                        '//div[@id="poExpander"]/div[1]/div/table/tr[7]/td[2]/span/text()',
                        '//div[@class="a-expander-content a-expander-partial-collapse-content"]/div/table/tr[7]/td[2]/span/text()',
                        '//div[@class="a-section a-spacing-small a-spacing-top-small"]/table/tr[7]/td[2]/span/text()',
                        '//div[@id="productOverview_feature_div"]/div/div[1]/div/table/tr[7]/td[2]/span/text()',
                        '//div[@data-a-expander-name="product_overview"]/div[1]/div/table/tr[7]/td[2]/span/text()',
                        '//div[@class="a-expander-collapsed-height a-row a-expander-container a-spacing-none a-expander-partial-collapse-container"]/div[1]/div/table/tr[7]/td[2]/span/text()',
                        '//div[@class="celwidget"]/div/div[1]/div/table/tr[7]/td[2]/span/text()',
                        '/html/body/div[1]/div/div/div[4]/div[4]/div[43]/div/div[1]/div/table/tr[7]/td[2]/span/text()'
                      ]
                    },
                    {
                      _fn: 'regex_search',
                      _args: ['^\\s*(.[\s\\S]*?)\\s*$', 1]
                    }
                  ]
                },
                operating_system: {
                  _fns: [
                    {
                      _fn: 'xpath_one',
                      _args: [
                        '//div[@id="poExpander"]/div[1]/div/table/tr[8]/td[2]/span/text()',
                        '//div[@class="celwidget"]/div/div[1]/div/table/tr[8]/td[2]/span/text()',
                        '//div[@data-a-expander-name="product_overview"]/div[1]/div/table/tr[8]/td[2]/span/text()',
                        '//div[@class="a-section a-spacing-small a-spacing-top-small"]/table/tr[8]/td[2]/span/text()',
                        '//tr[@class="a-spacing-small po-operating_system"]/td[2]/span/text()',
                        '//div[@class="a-expander-content a-expander-partial-collapse-content"]/div/table/tr[8]/td[2]/span/text()',
                        '//div[@data-expanded="false"]/div/table/tr[8]/td[2]/span/text()',
                        '//div[@class="a-expander-collapsed-height a-row a-expander-container a-spacing-none a-expander-partial-collapse-container"]/div[1]/div/table/tr[8]/td[2]/span/text()',
                        '//div[@id="productOverview_feature_div"]/div/div[1]/div/table/tr[8]/td[2]/span/text()',
                        '//table[@class="a-normal a-spacing-micro"]/tr[8]/td[2]/span/text()',
                        '/html/body/div[1]/div/div/div[4]/div[4]/div[43]/div/div[1]/div/table/tr[8]/td[2]/span/text()'
                      ]
                    },
                    {
                      _fn: 'regex_search',
                      _args: ['^\\s*(.[\s\\S]*?)\\s*$', 1]
                    }
                  ]
                },
                graphics_card_description: {
                  _fns: [
                    {
                      _fn: 'xpath_one',
                      _args: [
                        '//div[@data-expanded="false"]/div/table/tr[9]/td[2]/span/text()',
                        '//tr[@class="a-spacing-small po-graphics_description"]/td[2]/span/text()',
                        '//div[@class="a-expander-collapsed-height a-row a-expander-container a-spacing-none a-expander-partial-collapse-container"]/div[1]/div/table/tr[9]/td[2]/span/text()',
                        '//table[@class="a-normal a-spacing-micro"]/tr[9]/td[2]/span/text()',
                        '//div[@class="a-section a-spacing-small a-spacing-top-small"]/table/tr[9]/td[2]/span/text()',
                        '//div[@class="a-expander-content a-expander-partial-collapse-content"]/div/table/tr[9]/td[2]/span/text()',
                        '//div[@class="celwidget"]/div/div[1]/div/table/tr[9]/td[2]/span/text()',
                        '//div[@id="poExpander"]/div[1]/div/table/tr[9]/td[2]/span/text()',
                        '//div[@data-a-expander-name="product_overview"]/div[1]/div/table/tr[9]/td[2]/span/text()',
                        '//div[@id="productOverview_feature_div"]/div/div[1]/div/table/tr[9]/td[2]/span/text()',
                        '/html/body/div[1]/div/div/div[4]/div[4]/div[43]/div/div[1]/div/table/tr[9]/td[2]/span/text()'
                      ]
                    },
                    {
                      _fn: 'regex_search',
                      _args: ['^\\s*(.[\s\\S]*?)\\s*$', 1]
                    }
                  ]
                },
                graphics_coprocessor: {
                  _fns: [
                    {
                      _fn: 'xpath_one',
                      _args: [
                        '//div[@id="productOverview_feature_div"]/div/div[1]/div/table/tr[10]/td[2]/span/text()',
                        '//div[@class="a-section a-spacing-small a-spacing-top-small"]/table/tr[10]/td[2]/span/text()',
                        '//div[@data-expanded="false"]/div/table/tr[10]/td[2]/span/text()',
                        '//div[@id="poExpander"]/div[1]/div/table/tr[10]/td[2]/span/text()',
                        '//div[@class="a-expander-content a-expander-partial-collapse-content"]/div/table/tr[10]/td[2]/span/text()',
                        '//div[@class="a-expander-collapsed-height a-row a-expander-container a-spacing-none a-expander-partial-collapse-container"]/div[1]/div/table/tr[10]/td[2]/span/text()',
                        '//div[@data-a-expander-name="product_overview"]/div[1]/div/table/tr[10]/td[2]/span/text()',
                        '//table[@class="a-normal a-spacing-micro"]/tr[10]/td[2]/span/text()',
                        '//tr[@class="a-spacing-small po-graphics_coprocessor"]/td[2]/span/text()',
                        '//div[@class="celwidget"]/div/div[1]/div/table/tr[10]/td[2]/span/text()',
                        '/html/body/div[1]/div/div/div[4]/div[4]/div[43]/div/div[1]/div/table/tr[10]/td[2]/span/text()'
                      ]
                    },
                    {
                      _fn: 'regex_search',
                      _args: ['^\\s*(.[\s\\S]*?)\\s*$', 1]
                    }
                  ]
                }
              }
            })
          })

          const data: OxylabsResponse = await response.json()
          const result = data.results[0]

          if (!result || result.status_code !== 200) {
            throw new Error(`Failed to fetch product data: ${result?.status_code}`)
          }

          const content = result.content
          const extractPrice = (priceStr: string | null | undefined) => {
            if (!priceStr) return null
            const match = priceStr.match(/[\d,.]+/)
            return match ? parseFloat(match[0].replace(',', '')) : null
          }

          const extractRating = (ratingStr: string | undefined) => {
            if (!ratingStr) return null
            const match = ratingStr.match(/\d+\.?\d*/)
            return match ? parseFloat(match[0]) : null
          }

          const extractReviewCount = (reviewStr: string | undefined) => {
            if (!reviewStr) return null
            const match = reviewStr.match(/\d+/)
            return match ? parseInt(match[0]) : null
          }

          // Update the laptop record
          const { error: updateError } = await supabaseClient
            .from('products')
            .update({
              title: content.title,
              current_price: extractPrice(content.price),
              rating: extractRating(content.ratings),
              rating_count: extractReviewCount(content.reviews),
              brand: content.brand,
              model: content.model_name,
              processor: content.cpu_model,
              ram: content.ram_memory_installed_size,
              storage: content.hard_disk_size,
              screen_size: content.screen_size,
              graphics: content.graphics_card_description || content.graphics_coprocessor,
              last_checked: new Date().toISOString(),
              update_status: 'complete'
            })
            .eq('id', laptop.id)

          if (updateError) {
            throw new Error(`Failed to update laptop: ${updateError.message}`)
          }

          return {
            asin: laptop.asin,
            status: 'updated'
          }
        } catch (error) {
          console.error(`Error updating laptop ${laptop.asin}:`, error)
          
          await supabaseClient
            .from('products')
            .update({
              update_status: 'error',
              last_checked: new Date().toISOString()
            })
            .eq('id', laptop.id)

          return {
            asin: laptop.asin,
            status: 'error',
            error: error.message
          }
        }
      })
    )

    return new Response(
      JSON.stringify({
        updated_count: parsedLaptops.length,
        results: parsedLaptops
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error in update-laptops function:', error)
    
    return new Response(
      JSON.stringify({
        error: error.message || 'An unexpected error occurred'
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
