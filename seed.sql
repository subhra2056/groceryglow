-- ================================================================
-- GroceryGlow — 40 seed products across all categories
-- Run in: Supabase Dashboard → SQL Editor
-- Safe to re-run: skips any slug that already exists
-- ================================================================

-- FRESH FRUITS (5)
INSERT INTO products (name, slug, category_id, short_description, price, discount_price, stock, images, is_featured, is_organic, tags)
SELECT 'Navel Orange','navel-orange',(SELECT id FROM categories WHERE slug='fresh-fruits'),'Juicy seedless navel oranges, rich in Vitamin C',59.00,49.00,180,ARRAY['https://images.unsplash.com/photo-1547514701-42782101795e?w=400&q=80'],true,false,ARRAY['offer','fresh']
WHERE NOT EXISTS (SELECT 1 FROM products WHERE slug='navel-orange');

INSERT INTO products (name, slug, category_id, short_description, price, discount_price, stock, images, is_featured, is_organic, tags)
SELECT 'Alphonso Mango','alphonso-mango',(SELECT id FROM categories WHERE slug='fresh-fruits'),'Premium Alphonso mangoes, the king of fruits',149.00,129.00,100,ARRAY['https://images.unsplash.com/photo-1553279768-865429fa0078?w=400&q=80'],true,false,ARRAY['seasonal','bestseller']
WHERE NOT EXISTS (SELECT 1 FROM products WHERE slug='alphonso-mango');

INSERT INTO products (name, slug, category_id, short_description, price, discount_price, stock, images, is_featured, is_organic, tags)
SELECT 'Seedless Watermelon','seedless-watermelon',(SELECT id FROM categories WHERE slug='fresh-fruits'),'Sweet and refreshing seedless watermelon',89.00,NULL,60,ARRAY['https://images.unsplash.com/photo-1563114773-84221bd62daa?w=400&q=80'],false,false,ARRAY['seasonal','fresh']
WHERE NOT EXISTS (SELECT 1 FROM products WHERE slug='seedless-watermelon');

INSERT INTO products (name, slug, category_id, short_description, price, discount_price, stock, images, is_featured, is_organic, tags)
SELECT 'Fresh Pineapple','fresh-pineapple',(SELECT id FROM categories WHERE slug='fresh-fruits'),'Tropical sweet pineapple, freshly sourced',79.00,69.00,75,ARRAY['https://images.unsplash.com/photo-1550258987-190a2d41a8ba?w=400&q=80'],true,false,ARRAY['tropical','offer']
WHERE NOT EXISTS (SELECT 1 FROM products WHERE slug='fresh-pineapple');

INSERT INTO products (name, slug, category_id, short_description, price, discount_price, stock, images, is_featured, is_organic, tags)
SELECT 'Red Grapes','red-grapes',(SELECT id FROM categories WHERE slug='fresh-fruits'),'Plump and juicy seedless red grapes',99.00,89.00,110,ARRAY['https://images.unsplash.com/photo-1537640538966-79f369143f8f?w=400&q=80'],false,false,ARRAY['fresh','bestseller']
WHERE NOT EXISTS (SELECT 1 FROM products WHERE slug='red-grapes');

-- VEGETABLES (5)
INSERT INTO products (name, slug, category_id, short_description, price, discount_price, stock, images, is_featured, is_organic, tags)
SELECT 'Baby Carrots','baby-carrots',(SELECT id FROM categories WHERE slug='vegetables'),'Tender baby carrots, washed and ready to eat',39.00,NULL,200,ARRAY['https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=400&q=80'],false,false,ARRAY['fresh']
WHERE NOT EXISTS (SELECT 1 FROM products WHERE slug='baby-carrots');

INSERT INTO products (name, slug, category_id, short_description, price, discount_price, stock, images, is_featured, is_organic, tags)
SELECT 'Baby Spinach','baby-spinach',(SELECT id FROM categories WHERE slug='vegetables'),'Tender baby spinach leaves, triple washed',49.00,39.00,160,ARRAY['https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400&q=80'],true,false,ARRAY['fresh','offer']
WHERE NOT EXISTS (SELECT 1 FROM products WHERE slug='baby-spinach');

INSERT INTO products (name, slug, category_id, short_description, price, discount_price, stock, images, is_featured, is_organic, tags)
SELECT 'Red Bell Pepper','red-bell-pepper',(SELECT id FROM categories WHERE slug='vegetables'),'Crisp and sweet red capsicum',59.00,49.00,130,ARRAY['https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=400&q=80'],false,false,ARRAY['fresh']
WHERE NOT EXISTS (SELECT 1 FROM products WHERE slug='red-bell-pepper');

INSERT INTO products (name, slug, category_id, short_description, price, discount_price, stock, images, is_featured, is_organic, tags)
SELECT 'English Cucumber','english-cucumber',(SELECT id FROM categories WHERE slug='vegetables'),'Long and crisp English cucumbers, seedless',35.00,NULL,190,ARRAY['https://images.unsplash.com/photo-1604977042946-1eecc30f269e?w=400&q=80'],false,false,ARRAY['fresh']
WHERE NOT EXISTS (SELECT 1 FROM products WHERE slug='english-cucumber');

INSERT INTO products (name, slug, category_id, short_description, price, discount_price, stock, images, is_featured, is_organic, tags)
SELECT 'Sweet Corn','sweet-corn',(SELECT id FROM categories WHERE slug='vegetables'),'Farm-fresh sweet corn on the cob',29.00,NULL,220,ARRAY['https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=400&q=80'],false,false,ARRAY['fresh','seasonal']
WHERE NOT EXISTS (SELECT 1 FROM products WHERE slug='sweet-corn');

-- DAIRY & EGGS (5)
INSERT INTO products (name, slug, category_id, short_description, price, discount_price, stock, images, is_featured, is_organic, tags)
SELECT 'Farm Fresh Eggs','farm-fresh-eggs',(SELECT id FROM categories WHERE slug='dairy'),'Free-range eggs from happy hens, pack of 12',89.00,79.00,150,ARRAY['https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=400&q=80'],true,false,ARRAY['bestseller']
WHERE NOT EXISTS (SELECT 1 FROM products WHERE slug='farm-fresh-eggs');

INSERT INTO products (name, slug, category_id, short_description, price, discount_price, stock, images, is_featured, is_organic, tags)
SELECT 'Cheddar Cheese Block','cheddar-cheese-block',(SELECT id FROM categories WHERE slug='dairy'),'Aged sharp cheddar cheese, 200g block',199.00,179.00,80,ARRAY['https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=400&q=80'],true,false,ARRAY['bestseller']
WHERE NOT EXISTS (SELECT 1 FROM products WHERE slug='cheddar-cheese-block');

INSERT INTO products (name, slug, category_id, short_description, price, discount_price, stock, images, is_featured, is_organic, tags)
SELECT 'Greek Yogurt','greek-yogurt',(SELECT id FROM categories WHERE slug='dairy'),'Thick and creamy Greek yogurt, high in protein',99.00,89.00,120,ARRAY['https://images.unsplash.com/photo-1571167530149-c1105da4cc66?w=400&q=80'],false,false,ARRAY['healthy']
WHERE NOT EXISTS (SELECT 1 FROM products WHERE slug='greek-yogurt');

INSERT INTO products (name, slug, category_id, short_description, price, discount_price, stock, images, is_featured, is_organic, tags)
SELECT 'Salted Butter','salted-butter',(SELECT id FROM categories WHERE slug='dairy'),'Creamy salted butter, 100g block',79.00,NULL,100,ARRAY['https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=400&q=80'],false,false,ARRAY['fresh']
WHERE NOT EXISTS (SELECT 1 FROM products WHERE slug='salted-butter');

INSERT INTO products (name, slug, category_id, short_description, price, discount_price, stock, images, is_featured, is_organic, tags)
SELECT 'Fresh Paneer','fresh-paneer',(SELECT id FROM categories WHERE slug='dairy'),'Soft and fresh homestyle paneer, 200g',119.00,99.00,90,ARRAY['https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=400&q=80'],true,false,ARRAY['bestseller']
WHERE NOT EXISTS (SELECT 1 FROM products WHERE slug='fresh-paneer');

-- BAKERY (5)
INSERT INTO products (name, slug, category_id, short_description, price, discount_price, stock, images, is_featured, is_organic, tags)
SELECT 'Whole Wheat Bread','whole-wheat-bread',(SELECT id FROM categories WHERE slug='bakery'),'Soft whole wheat sandwich bread, baked fresh',55.00,49.00,60,ARRAY['https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&q=80'],false,false,ARRAY['healthy','new']
WHERE NOT EXISTS (SELECT 1 FROM products WHERE slug='whole-wheat-bread');

INSERT INTO products (name, slug, category_id, short_description, price, discount_price, stock, images, is_featured, is_organic, tags)
SELECT 'Butter Croissant','butter-croissant',(SELECT id FROM categories WHERE slug='bakery'),'Flaky golden butter croissant, freshly baked',45.00,NULL,50,ARRAY['https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400&q=80'],true,false,ARRAY['fresh','bestseller']
WHERE NOT EXISTS (SELECT 1 FROM products WHERE slug='butter-croissant');

INSERT INTO products (name, slug, category_id, short_description, price, discount_price, stock, images, is_featured, is_organic, tags)
SELECT 'Blueberry Muffin','blueberry-muffin',(SELECT id FROM categories WHERE slug='bakery'),'Moist blueberry muffin packed with real berries',55.00,45.00,45,ARRAY['https://images.unsplash.com/photo-1607958996333-41aef7caefaa?w=400&q=80'],false,false,ARRAY['sweet','fresh']
WHERE NOT EXISTS (SELECT 1 FROM products WHERE slug='blueberry-muffin');

INSERT INTO products (name, slug, category_id, short_description, price, discount_price, stock, images, is_featured, is_organic, tags)
SELECT 'Cinnamon Roll','cinnamon-roll',(SELECT id FROM categories WHERE slug='bakery'),'Soft cinnamon roll with vanilla glaze',65.00,NULL,35,ARRAY['https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=400&q=80'],true,false,ARRAY['sweet','bestseller']
WHERE NOT EXISTS (SELECT 1 FROM products WHERE slug='cinnamon-roll');

INSERT INTO products (name, slug, category_id, short_description, price, discount_price, stock, images, is_featured, is_organic, tags)
SELECT 'Banana Bread','banana-bread',(SELECT id FROM categories WHERE slug='bakery'),'Moist homestyle banana bread, freshly baked',85.00,75.00,30,ARRAY['https://images.unsplash.com/photo-1493770348161-369560ae357d?w=400&q=80'],false,false,ARRAY['sweet']
WHERE NOT EXISTS (SELECT 1 FROM products WHERE slug='banana-bread');

-- BEVERAGES (5)
INSERT INTO products (name, slug, category_id, short_description, price, discount_price, stock, images, is_featured, is_organic, tags)
SELECT 'Fresh Orange Juice','fresh-orange-juice',(SELECT id FROM categories WHERE slug='beverages'),'Cold-pressed fresh orange juice, no added sugar',99.00,89.00,80,ARRAY['https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=400&q=80'],true,false,ARRAY['fresh','healthy','offer']
WHERE NOT EXISTS (SELECT 1 FROM products WHERE slug='fresh-orange-juice');

INSERT INTO products (name, slug, category_id, short_description, price, discount_price, stock, images, is_featured, is_organic, tags)
SELECT 'Sparkling Mineral Water','sparkling-mineral-water',(SELECT id FROM categories WHERE slug='beverages'),'Refreshing sparkling mineral water, 1L bottle',49.00,NULL,200,ARRAY['https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=400&q=80'],false,false,ARRAY['healthy']
WHERE NOT EXISTS (SELECT 1 FROM products WHERE slug='sparkling-mineral-water');

INSERT INTO products (name, slug, category_id, short_description, price, discount_price, stock, images, is_featured, is_organic, tags)
SELECT 'Cold Brew Coffee','cold-brew-coffee',(SELECT id FROM categories WHERE slug='beverages'),'Smooth and rich cold brew coffee, ready to drink',149.00,129.00,60,ARRAY['https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&q=80'],true,false,ARRAY['bestseller','new']
WHERE NOT EXISTS (SELECT 1 FROM products WHERE slug='cold-brew-coffee');

INSERT INTO products (name, slug, category_id, short_description, price, discount_price, stock, images, is_featured, is_organic, tags)
SELECT 'Organic Green Tea','organic-green-tea',(SELECT id FROM categories WHERE slug='beverages'),'Premium organic green tea leaves, 100g pack',199.00,169.00,70,ARRAY['https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&q=80'],false,true,ARRAY['healthy','organic']
WHERE NOT EXISTS (SELECT 1 FROM products WHERE slug='organic-green-tea');

INSERT INTO products (name, slug, category_id, short_description, price, discount_price, stock, images, is_featured, is_organic, tags)
SELECT 'Tender Coconut Water','tender-coconut-water',(SELECT id FROM categories WHERE slug='beverages'),'Natural electrolyte-rich tender coconut water, 300ml',59.00,49.00,90,ARRAY['https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=400&q=80'],true,false,ARRAY['healthy','fresh','offer']
WHERE NOT EXISTS (SELECT 1 FROM products WHERE slug='tender-coconut-water');

-- MEAT & SEAFOOD (5)
INSERT INTO products (name, slug, category_id, short_description, price, discount_price, stock, images, is_featured, is_organic, tags)
SELECT 'Chicken Breast','chicken-breast',(SELECT id FROM categories WHERE slug='meat-seafood'),'Fresh boneless skinless chicken breast, 500g',249.00,219.00,100,ARRAY['https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=400&q=80'],true,false,ARRAY['fresh','bestseller','protein']
WHERE NOT EXISTS (SELECT 1 FROM products WHERE slug='chicken-breast');

INSERT INTO products (name, slug, category_id, short_description, price, discount_price, stock, images, is_featured, is_organic, tags)
SELECT 'Atlantic Salmon Fillet','atlantic-salmon-fillet',(SELECT id FROM categories WHERE slug='meat-seafood'),'Fresh Atlantic salmon fillet, skin-on, 300g',399.00,349.00,50,ARRAY['https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=400&q=80'],true,false,ARRAY['fresh','healthy','protein']
WHERE NOT EXISTS (SELECT 1 FROM products WHERE slug='atlantic-salmon-fillet');

INSERT INTO products (name, slug, category_id, short_description, price, discount_price, stock, images, is_featured, is_organic, tags)
SELECT 'Tiger Prawns','tiger-prawns',(SELECT id FROM categories WHERE slug='meat-seafood'),'Large fresh tiger prawns, cleaned and deveined, 250g',349.00,299.00,40,ARRAY['https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=400&q=80'],false,false,ARRAY['fresh','seafood']
WHERE NOT EXISTS (SELECT 1 FROM products WHERE slug='tiger-prawns');

INSERT INTO products (name, slug, category_id, short_description, price, discount_price, stock, images, is_featured, is_organic, tags)
SELECT 'Minced Beef','minced-beef',(SELECT id FROM categories WHERE slug='meat-seafood'),'Fresh lean minced beef, 500g pack',299.00,NULL,60,ARRAY['https://images.unsplash.com/photo-1588347785102-2944a6f5e645?w=400&q=80'],false,false,ARRAY['fresh','protein']
WHERE NOT EXISTS (SELECT 1 FROM products WHERE slug='minced-beef');

INSERT INTO products (name, slug, category_id, short_description, price, discount_price, stock, images, is_featured, is_organic, tags)
SELECT 'Tuna Steak','tuna-steak',(SELECT id FROM categories WHERE slug='meat-seafood'),'Premium yellowfin tuna steak, 200g',449.00,399.00,30,ARRAY['https://images.unsplash.com/photo-1502741338009-cac2772e18bc?w=400&q=80'],true,false,ARRAY['fresh','seafood','healthy']
WHERE NOT EXISTS (SELECT 1 FROM products WHERE slug='tuna-steak');

-- SNACKS (5)
INSERT INTO products (name, slug, category_id, short_description, price, discount_price, stock, images, is_featured, is_organic, tags)
SELECT 'Roasted Mixed Nuts','roasted-mixed-nuts',(SELECT id FROM categories WHERE slug='snacks'),'Premium mix of cashews, almonds, walnuts and pistachios, 200g',299.00,269.00,120,ARRAY['https://images.unsplash.com/photo-1599940824399-b87987ceb72a?w=400&q=80'],true,false,ARRAY['healthy','bestseller']
WHERE NOT EXISTS (SELECT 1 FROM products WHERE slug='roasted-mixed-nuts');

INSERT INTO products (name, slug, category_id, short_description, price, discount_price, stock, images, is_featured, is_organic, tags)
SELECT 'Sea Salt Chips','sea-salt-chips',(SELECT id FROM categories WHERE slug='snacks'),'Crunchy kettle-cooked potato chips with sea salt, 150g',79.00,69.00,180,ARRAY['https://images.unsplash.com/photo-1600952841320-db92ec4047ca?w=400&q=80'],false,false,ARRAY['bestseller']
WHERE NOT EXISTS (SELECT 1 FROM products WHERE slug='sea-salt-chips');

INSERT INTO products (name, slug, category_id, short_description, price, discount_price, stock, images, is_featured, is_organic, tags)
SELECT '70% Dark Chocolate','dark-chocolate-70',(SELECT id FROM categories WHERE slug='snacks'),'Rich 70% cocoa dark chocolate bar, 100g',149.00,129.00,90,ARRAY['https://images.unsplash.com/photo-1548907040-4baa42d10919?w=400&q=80'],true,false,ARRAY['bestseller','sweet']
WHERE NOT EXISTS (SELECT 1 FROM products WHERE slug='dark-chocolate-70');

INSERT INTO products (name, slug, category_id, short_description, price, discount_price, stock, images, is_featured, is_organic, tags)
SELECT 'Oats Granola Bar','oats-granola-bar',(SELECT id FROM categories WHERE slug='snacks'),'Chewy oats granola bar with honey and nuts, pack of 5',129.00,109.00,150,ARRAY['https://images.unsplash.com/photo-1571748982800-fa51082c2224?w=400&q=80'],false,false,ARRAY['healthy','new']
WHERE NOT EXISTS (SELECT 1 FROM products WHERE slug='oats-granola-bar');

INSERT INTO products (name, slug, category_id, short_description, price, discount_price, stock, images, is_featured, is_organic, tags)
SELECT 'Butter Popcorn','butter-popcorn',(SELECT id FROM categories WHERE slug='snacks'),'Light and fluffy butter popcorn, ready to eat, 100g',59.00,NULL,200,ARRAY['https://images.unsplash.com/photo-1578849278619-e73505e9610f?w=400&q=80'],false,false,ARRAY['snack']
WHERE NOT EXISTS (SELECT 1 FROM products WHERE slug='butter-popcorn');

-- ORGANIC (5)
INSERT INTO products (name, slug, category_id, short_description, price, discount_price, stock, images, is_featured, is_organic, tags)
SELECT 'Organic Avocado','organic-avocado',(SELECT id FROM categories WHERE slug='organic'),'Creamy ripe organic Hass avocados',149.00,129.00,80,ARRAY['https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=400&q=80'],true,true,ARRAY['healthy','organic','offer']
WHERE NOT EXISTS (SELECT 1 FROM products WHERE slug='organic-avocado');

INSERT INTO products (name, slug, category_id, short_description, price, discount_price, stock, images, is_featured, is_organic, tags)
SELECT 'Organic Honey','organic-honey',(SELECT id FROM categories WHERE slug='organic'),'Raw unfiltered organic wildflower honey, 250g',349.00,299.00,60,ARRAY['https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=400&q=80'],true,true,ARRAY['organic','healthy','bestseller']
WHERE NOT EXISTS (SELECT 1 FROM products WHERE slug='organic-honey');

INSERT INTO products (name, slug, category_id, short_description, price, discount_price, stock, images, is_featured, is_organic, tags)
SELECT 'Organic Turmeric Powder','organic-turmeric-powder',(SELECT id FROM categories WHERE slug='organic'),'Pure organic turmeric powder, high curcumin content, 100g',199.00,169.00,100,ARRAY['https://images.unsplash.com/photo-1615485290382-441bfedaa563?w=400&q=80'],false,true,ARRAY['organic','spice','healthy']
WHERE NOT EXISTS (SELECT 1 FROM products WHERE slug='organic-turmeric-powder');

INSERT INTO products (name, slug, category_id, short_description, price, discount_price, stock, images, is_featured, is_organic, tags)
SELECT 'Organic Quinoa','organic-quinoa',(SELECT id FROM categories WHERE slug='organic'),'White organic quinoa, complete protein source, 500g',399.00,349.00,70,ARRAY['https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&q=80'],false,true,ARRAY['organic','healthy','grain']
WHERE NOT EXISTS (SELECT 1 FROM products WHERE slug='organic-quinoa');

INSERT INTO products (name, slug, category_id, short_description, price, discount_price, stock, images, is_featured, is_organic, tags)
SELECT 'Organic Kale','organic-kale',(SELECT id FROM categories WHERE slug='organic'),'Fresh organic kale leaves, superfood packed with nutrients',79.00,69.00,120,ARRAY['https://images.unsplash.com/photo-1525059696034-4967a8e1dca2?w=400&q=80'],true,true,ARRAY['organic','healthy','superfood']
WHERE NOT EXISTS (SELECT 1 FROM products WHERE slug='organic-kale');
