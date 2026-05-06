insert into categories (name_en, name_np, slug, icon, display_order) values
('Wires & Cables', 'तार र केबल', 'wires-cables', '🔌', 1),
('Switches & Sockets', 'स्विच र सकेट', 'switches-sockets', '🔲', 2),
('Lights & Fittings', 'बत्ती र फिटिङ', 'lights-fittings', '💡', 3),
('Fans', 'पंखा', 'fans', '🌀', 4),
('Solar', 'सोलार', 'solar', '☀️', 5),
('Tools & Equipment', 'औजार र उपकरण', 'tools-equipment', '🔧', 6),
('House Wiring Goods', 'घर वायरिङ सामान', 'house-wiring', '🏠', 7),
('MCBs & DBs', 'एमसीबी र डीबी', 'mcbs-dbs', '⚡', 8);

insert into services (title_en, title_np, description_en, description_np, icon, display_order) values
('House Wiring', 'घर वायरिङ', 'Complete house wiring for new and existing homes', 'नयाँ र पुराना घरहरूको लागि पूर्ण घर वायरिङ', '🏠', 1),
('Electrical Installation', 'विद्युतीय जडान', 'Installation of switches, fans, lights and appliances', 'स्विच, पंखा, बत्ती र उपकरणहरूको जडान', '🔧', 2),
('Repair & Maintenance', 'मर्मत र रखरखाव', 'Repair of all electrical faults and maintenance', 'सबै विद्युतीय खराबी र रखरखावको मर्मत', '🛠️', 3),
('Solar Installation', 'सोलार जडान', 'Solar panel and inverter installation', 'सोलार प्यानल र इन्भर्टर जडान', '☀️', 4),
('Inspection & Testing', 'निरीक्षण र परीक्षण', 'Electrical safety inspection and testing', 'विद्युतीय सुरक्षा निरीक्षण र परीक्षण', '🔍', 5);

insert into site_settings (key, value) values
('whatsapp_number', '9779849401009'),
('phone_number', '9779849401009'),
('store_address', 'Kohalpur, Banke, Nepal'),
('delivery_zones', 'Kohalpur, Banke'),
('announcement_banner', 'Free delivery across Kohalpur!');