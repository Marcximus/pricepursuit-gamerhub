
import { supabase } from "@/integrations/supabase/client";

export const removeAccessories = async () => {
  const accessoryKeywords = [
    'Charger Block',
    'Battery Replacement',
    'Replacement Laptop',
    'Stylus',
    'Messenger Case',
    'Protective Case',
    'Protective Sleeve',
    'Laptop Battery',
    'Laptop Charger',
    'Car Jump',
    'Headset',
    'Laptop Skin',
    'Charger Fit For',
    'Adapter Laptop Charger',
    'Mouse Pro',
    'Charger fit',
    'Charger for',
    'External Hard Drive',
    'Power Adapter',
    'Mouse',
    'Jump Starter',
    'Battery Jump',
    'Bag',
    'Laptop Stand',
    'Magic Keyboard',
    'Laptop Super Charger',
    'Backpack',
    'Cooling pad',
    'External Enclosure',
    'Display Panel',
    'Cable for',
    'Surface dock',
    'Surface docking',
    'Screen Extender',
    'Earbuds',
    'Screen Replacement',
    'dock triple',
    'Bagpacks',
    'Memory kit',
    'Soundbar',
    'Laptop AC Adapter',
    'Cooling fan replacement',
    'Laptop Bottom Base Case',
    'CPU FAN',
    'Replacement Keyboards',
    'Car Charger',
    'Adapter',
    'PIN LCD Display',
    'Power Cord Cable',
    'Charging Cable',
    'Hoodies',
    'Protector Cover',
    "Women's",
    'Women',
    'Pad Protector',
    'Feet Replacement',
    'Sync Cable',
    'Insulation Wrapping',
    'Replacement Memory Ram',
    'Cord Cable',
    'Screen Protector',
    'Charging Adapter',
    'Jack Connector',
    'Adapter Charger',
    'Wireless Mouse',
    'Rubber Feet Replacement',
    'PortChanger',
    'Touchpad protector',
    'Touch pad protector',
    'Touch pad film protector',
    'Charger Replacement',
    'Rubber Feet',
    'Laptop Sleeve',
    'Over-ear'
  ];

  try {
    console.log('Starting accessories removal process...');
    
    // Construct the ILIKE conditions for each keyword
    const titleConditions = accessoryKeywords.map(keyword => 
      `title ILIKE '%${keyword}%'`
    ).join(' OR ');

    // First get the IDs of products to be removed
    const { data: productsToRemove, error: fetchError } = await supabase
      .from('products')
      .select('id, title')
      .or(titleConditions);

    if (fetchError) {
      console.error('Error fetching products to remove:', fetchError);
      throw fetchError;
    }

    if (!productsToRemove || productsToRemove.length === 0) {
      console.log('No accessories found to remove');
      return { removedCount: 0 };
    }

    const productIds = productsToRemove.map(p => p.id);
    console.log(`Found ${productIds.length} accessories to remove`);

    // Delete associated reviews
    const { error: reviewsError } = await supabase
      .from('product_reviews')
      .delete()
      .in('product_id', productIds);

    if (reviewsError) {
      console.error('Error deleting reviews:', reviewsError);
      throw reviewsError;
    }

    // Delete associated price history
    const { error: priceHistoryError } = await supabase
      .from('price_history')
      .delete()
      .in('product_id', productIds);

    if (priceHistoryError) {
      console.error('Error deleting price history:', priceHistoryError);
      throw priceHistoryError;
    }

    // Finally, delete the products
    const { error: productsError } = await supabase
      .from('products')
      .delete()
      .in('id', productIds);

    if (productsError) {
      console.error('Error deleting products:', productsError);
      throw productsError;
    }

    console.log(`Successfully removed ${productIds.length} accessories`);
    return { 
      removedCount: productIds.length,
      removedTitles: productsToRemove.map(p => p.title)
    };
  } catch (error) {
    console.error('Error in removeAccessories:', error);
    throw error;
  }
};
