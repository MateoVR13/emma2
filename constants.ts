

import { Product, SkincareRoutine, DiagnosticDefinition } from './types';

// DATOS CARGADOS INTERNAMENTE (Base de Datos Emma Glow)
const RAW_CSV_DATA = `id;nombre;marca;tipo;precio;ingredientes;puntos_venta;origen;tipo
1;Effaclar Gel + M Espuma Purificante de Limpieza;La Roche Posay;Limpiador;144720;Tensioactivos suaves;Farmatodo, Cruz Verde, Medipiel, Locatel.;Internacional;LIMPIADORES
2;Dermopure Gel Limpiador;Eucerin;Limpiador;80000;Ácido Salicílico;Farmatodo, Cruz Verde, Medipiel.;Internacional;LIMPIADORES
3;Effaclar Gel Purificante Micro-Exfoliante;La Roche Posay;Limpiador;144720;Ácido Salicílico, LHA, Zinc;Farmatodo, Cruz Verde, Medipiel.;Internacional;LIMPIADORES
4;Gel Limpiador Espumoso x 473Ml;Cerave;Limpiador;97561;3 Ceramidas Esenciales, Niacinamida;Amplia Distribución (Farmacias y Supermercados).;Internacional;LIMPIADORES
5;Gel Limpiador Anti-rugosidades;Cerave;Limpiador;72990;Ácido Salicílico, Ceramidas, Niacinamida;Farmacias de Cadena.;Internacional;LIMPIADORES
6;Sensibio Gel Moussant Limpíador;Bioderma;Limpiador;70900;Aquagenium, Vitamina PP;Medipiel, Droguerías Especializadas.;Internacional;LIMPIADORES
7;Gel Limpiador Piel Mixta/Grasa;Dhems;Limpiador;60950;(Extractos botánicos);Medipiel, Farmatodo, Cruz Verde.;Local;LIMPIADORES
8;Effaclar Serum Ultra Concentrado;La Roche Posay;Serum;160000;Ácido Salicílico, Ácido Glicólico, LHA;Farmatodo, Cruz Verde, Medipiel.;Internacional;TRATAMIENTOS / SÉRUMS
9;Mela B3 Serum Antimanchas;La Roche Posay;Serum;202130;Niacinamida, Melasyl, Retinol;Farmatodo, Medipiel.;Internacional;TRATAMIENTOS / SÉRUMS
10;Serum Facial Triple Accion Oil Control;Cetaphil;Serum;136000;Ácido Salicílico, Té Blanco, Aloe Vera;Farmatodo, La Rebaja.;Internacional;TRATAMIENTOS / SÉRUMS
11;Solucion Tonificante Acido Glicolico;The Ordinary;Tónico/Serum;144900;Ácido Glicólico 7%;Blush-Bar, Falabella, Tiendas Online Especializadas.;Internacional;TRATAMIENTOS / SÉRUMS
12;Tratamiento Anti-imperfeccciones Duo+M;La Roche Posay;Tratamiento;141020;LHA, Procerad TM, Niacinamida;Farmatodo, Cruz Verde, Medipiel.;Internacional;TRATAMIENTOS / SÉRUMS
13;Serum Purificador de Poros;Dhems;Serum;65000;Sal de Zinc, Ácido Salicílico (BHA);Medipiel, Farmatodo, Tiendas Especializadas.;Local;TRATAMIENTOS / SÉRUMS
14;Serum Facial Antiedad Anti-Pigment Dual;Eucerin;Serum;275100;Thiamidol, Ácido Hialurónico;Farmatodo, Locatel, Droguerías Especializadas.;Internacional;TRATAMIENTOS / SÉRUMS
15;Exfoliante Skin Perfecting 2 % BHA;P. Choice;Exfoliante;172000;BHA (Ácido Salicílico 2%), Té Verde;Blush-Bar, Tiendas Online Especializadas.;Internacional;TRATAMIENTOS / SÉRUMS
16;Sérum Ácido Hialurónico;Infinitek;Serum;99900;Ácido Hialurónico, Vitamina B5;Online (Sitio Propio), Falabella, Tiendas de Belleza.;Local;INF-1
17;Sérum Vitamina C;Dhems;Serum;87000;Vitamina C;Medipiel, Farmatodo.;Local;DHE-1
18;Hidratante Facial Antimanchas Oil Control;Cetaphil;Crema;128897;Ácido Salicílico, Bisabolol;Farmatodo, Cruz Verde, La Rebaja.;Internacional;HIDRATANTES / CALMANTES
19;Acnestil Attiva X 40Ml;Rilastil;Crema;158500;Niacinamida, Ácido Azelaico, Glicina;Droguerías Especializadas.;Internacional;HIDRATANTES / CALMANTES
20;Optimal Hydration Water Gel;Cetaphil;Crema;119950;Ácido Hialurónico, Ácido Poli Glutámico;Farmatodo, La Rebaja.;Internacional;HIDRATANTES / CALMANTES
21;Crema Calmante Sensibio Ds 40 Ml;Bioderma;Crema;104175;Tecnología DSactive™;Medipiel, Droguerías Especializadas.;Internacional;HIDRATANTES / CALMANTES
22;Teen Derm Hydra 40Ml;Isispharma;Crema;110100;Manteca de Cacao, Bisabolol;Medipiel, Droguerías Especializadas.;Internacional;HIDRATANTES / CALMANTES
23;Cicaplast Baume B5+ x 40 Ml;La Roche Posay;Bálsamo;52000;Vitamina B5, Madecassosside;Amplia Distribución (Todas las Farmacias de Cadena).;Internacional;HIDRATANTES / CALMANTES
24;Crema Hidratante x 170Gr;Cerave;Crema;42700;Ceramidas, Ácido Hialurónico;Amplia Distribución.;Internacional;HIDRATANTES / CALMANTES
25;Hidratante Facial Equilibrante;Ana María;Crema;72200;Extractos Vegetales;Supermercados (Éxito), Droguerías Masivas.;Local;ANA-1
26;Fusion Water Magic SPF 50;Isdin;Bloqueador;105000;(Filtros solares avanzados);Medipiel, Droguerías Especializadas.;Internacional;PROTECCIÓN SOLAR
27;Anthelios UvMune 400 SPF 50;La Roche Posay;Bloqueador;89148;Niacinamida, Filtro Mexoryl 400;Farmatodo, Cruz Verde, Medipiel.;Internacional;PROTECCIÓN SOLAR
28;Heliocare 360° Spf 50 50 Ml;Heliocare;Bloqueador;157930;Filtros solares, Fernblock;Medipiel, Droguerías Especializadas.;Internacional;PROTECCIÓN SOLAR
29;Protector Solar Crema Gel;Ana María;Bloqueador;57900;Filtros UVA / UVB;Supermercados, Droguerías Masivas.;Local;ANA-2
30;Mascarilla de Barro del Mar Muerto;Infinitek;Mascarilla;89900;Barro del Mar Muerto, Caléndula;Online (Sitio Propio), Falabella.;Local;OTROS/MASK
31;Agua Micelar Sensibio H2O;Bioderma;Desmaquillante;34500;(Agentes limpiadores suaves);Farmatodo, Medipiel.;Internacional;OTROS/MASK
32;Sébium Gel Moussant Actif;Bioderma;Limpiador;95000;Ácido Salicílico, Ácido Glicólico;Medipiel, Cruz Verde;Internacional;LIMPIADORES
33;Ultra Facial Cleanser;Kiehl's;Limpiador;85000;Escualano, Aceite de semilla de albaricoque;Tiendas Propias, Falabella;Internacional;LIMPIADORES
34;Gentle Skin Cleanser;Cetaphil;Limpiador;55000;Niacinamida, Pantenol, Glicerina;Amplia Distribución;Internacional;LIMPIADORES
35;Effaclar H Iso-Biome Crema Limpiadora;La Roche Posay;Limpiador;98000;Aqua Posae Filiformis;Farmatodo, Cruz Verde, Medipiel;Internacional;LIMPIADORES
36;Blemish Cleansing Foam;Eucerin;Limpiador;75000;Decandiol, Carnitina;Farmatodo, Cruz Verde, Medipiel;Internacional;LIMPIADORES
37;Gel Limpiador Facial Antioxidante;oBOTICARIO (Nacional);Limpiador;48930;Vitamina c;Tiendas de Belleza, Distribución  (oboticario);Local;LIMPIADORES
38;Gel Limpiador Purificante;L'Oréal Paris;Limpiador;40000;Ácido Salicílico, Arcilla;Supermercados, Droguerías Masivas;Internacional;LIMPIADORES
39;Hydrating Cleansing Oil;Cerave;Limpiador;110000;Ceramidas, Escualano, Triglicéridos;Farmacias de Cadena, Supermercados;Internacional;LIMPIADORES
40;Gel Limpiador Facial Neutrogena Oil free Ácido Salicílico 177ml;Neutrogena;Limpiador;94000;Ácido Salicílico (2%);Amplia Distribución;Internacional;LIMPIADORES
41;Gel Limpiador Facial Equilibrante;Ana María;Limpiador;50000;Extractos Naturales;Supermercados (Éxito), Droguerías Masivas;Local;LIMPIADORES
42;Gel Limpiador Facial para ella;Botanique (nacional);Gel limpiador ;63500;Ácido láctico, aminoácidos de soya, urea, extracto de avena;Tienda en Línea, Puntos de Belleza;Local;LIMPIADORES
43;Gel Limpiador Purificante Sebiaclear;SVR;Limpiador;88000;Gluconolactona, Niacinamida;Medipiel, Droguerías Especializadas;Internacional;LIMPIADORES
44;Cleansing Milk (Leche Limpiadora);Avène;Limpiador;79000;Agua Termal de Avène;Farmatodo, Cruz Verde;Internacional;LIMPIADORES
45;Leche Desmaquillante Aloe Vera;Nivea;Limpiador;35000;Aloe Vera;Supermercados, Droguerías Masivas;Internacional;LIMPIADORES
46;Gel Limpiador Dermo Purificante;L'Occitane;Limpiador;100000;Aceites Esenciales;Tiendas Propias, Falabella;Internacional;LIMPIADORES
47;Toleriane Sensitive Crema;La Roche Posay;Crema;92000;Glicerina, Ceramidas, Agua Termal;Farmatodo, Cruz Verde, Medipiel;Internacional;HIDRATANTES
48;Hydro Boost Gel Water;Neutrogena;Gel Hidratante;78000;Ácido Hialurónico;Amplia Distribución;Internacional;HIDRATANTES
49;Aqualia Thermal Crema Rehidratante;Vichy;Crema;105000;Agua Volcánica de Vichy, Ácido Hialurónico;Farmatodo, Cruz Verde, Medipiel;Internacional;HIDRATANTES
50;Revitalift Ácido Hialurónico Crema;L'Oréal Paris;Crema;65000;Ácido Hialurónico, Pro-Xylane;Supermercados, Droguerías Masivas;Internacional;HIDRATANTES
51;Crema Hidratante Facial;Cerave;Crema;60000;3 Ceramidas Esenciales, Ácido Hialurónico;Amplia Distribución;Internacional;HIDRATANTES
52;Crema Nutritiva con aceite de Rosa Mosqueta;Dermanat (Nacional);Crema;48000;Aceite de Rosa Mosqueta, Vitamina E;Tiendas Naturistas, Distribución Local;Local;HIDRATANTES
53;DermoPure Oil Control Fluido Matificante;Eucerin;Fluido;90000;Tecnología de control de sebo;Farmatodo, Cruz Verde, Medipiel;Internacional;HIDRATANTES
54;Crème Hydratante;Bioderma;Crema;70000;Patente Aquagenium™;Medipiel, Cruz Verde;Internacional;HIDRATANTES
55;Atoderm Intensive Baume;Bioderma;Bálsamo;120000;Patente Skin Barrier Therapy™;Medipiel, Cruz Verde;Internacional;HIDRATANTES
56;Crema Caléndula Natural Freshly Frasco X 60 Gr;Natural freshly;Crema;115000;Extracto de Caléndula;Tiendas Propias, Falabella, farmatodo;Internacional;HIDRATANTES
57;Gel Hidratante Facial;Montoc (Nacional);Gel;40000;Aloe Vera, Pantenol;Tienda en Línea, Puntos de Venta;Local;HIDRATANTES
58;Crema Facial Hidratante de Día;Nivea;Crema;30000;Manteca de Karité;Supermercados, Droguerías Masivas;Internacional;HIDRATANTES
59;Gel Crema Hidratante 48H;Avène;Gel Crema;85000;Agua Termal de Avène, Cohederm™;Farmatodo, Cruz Verde;Internacional;HIDRATANTES
60;Emulsión Hidratante Facial;Cetaphil;Emulsión;65000;Glicerina, Aceite de Nuez de Macadamia;Amplia Distribución;Internacional;HIDRATANTES
61;Crema Corporal y Facial;Lubriderm;Crema;45000;Vitamina B5;Supermercados, Droguerías Masivas;Internacional;HIDRATANTES
62;Hidratante Facial Equilibrante;Ana María;Crema;72200;Extractos Vegetales;Supermercados (Éxito), Droguerías Masivas;Local;HIDRATANTES
63;Hidrasense Green Aqua Gel;Ana María;Gel;57000;Ácido Hialurónico, Extracto de Té Verde;Surticosméticos, Droguerías;Local;HIDRATANTES
64;Crema Hidratante Piel Normal a Seca;Eucerin;Crema;80000;Urea;Farmatodo, Cruz Verde, Medipiel;Internacional;HIDRATANTES
65;Ultra Repair Cream;First Aid Beauty;Crema;140000;Avena Coloidal;Tiendas Especializadas (Blush-Bar);Internacional;HIDRATANTES
66;Fotoprotector ISDIN Fusion Water Magic SPF 50;Isdin;Bloqueador;105000;Filtros solares avanzados, Ácido Hialurónico;Medipiel, Droguerías Especializadas;Internacional;PROTECCIÓN SOLAR
67;Anthelios UvMune 400 SPF 50+ Fluido con Color;La Roche Posay;Bloqueador;95000;Filtro Mexoryl 400, Niacinamida;Farmatodo, Cruz Verde, Medipiel;Internacional;PROTECCIÓN SOLAR
68;Heliocare 360° Gel Oil-Free SPF 50;Heliocare;Bloqueador;115000;Fernblock+, Té Verde;Medipiel, Droguerías Especializadas;Internacional;PROTECCIÓN SOLAR
69;Sun Protection Gel-Cream Oil Control SPF 50+;Eucerin;Bloqueador;100000;L-Carnitina, Tecnología Oil Control;Farmatodo, Cruz Verde, Medipiel;Internacional;PROTECCIÓN SOLAR
70;Photoderm MAX Aquafluide SPF 50+;Bioderma;Bloqueador;90000;Patente Cellular Bioprotection™;Medipiel, Cruz Verde;Internacional;PROTECCIÓN SOLAR
71;Protector Solar en Barra Con Color FPS 95;ollie (Nacional);Bloqueador;99000;Vitamina E y Ácido Hialurónico;Droguerías Masivas, Tiendas de Belleza;Local;PROTECCIÓN SOLAR
72;Sunface Gel Spf 50 70 G;SunFace;Bloqueador;101000;Filtros Uv;Tiendas en Línea, Importadores;Internacional;PROTECCIÓN SOLAR
73;Anthelios XL Toque Seco SPF 50+;La Roche Posay;Bloqueador;89148;Tecnología Airlicium;Farmatodo, Cruz Verde, Medipiel;Internacional;PROTECCIÓN SOLAR
74;Capital Soleil UV Age Daily SPF 50+;Vichy;Bloqueador;110000;Péptidos, Niacinamida, Fracciones Probióticas;Farmatodo, Cruz Verde, Medipiel;Internacional;PROTECCIÓN SOLAR
75;Protector Solar Control Brillo SPF 50;Nivea;Bloqueador;38000;Filtros UVA/UVB;Supermercados, Droguerías Masivas;Internacional;PROTECCIÓN SOLAR
76;Harumi Ginseng Aqua Sun Cream SPF50;Harumi (Coreano);Bloqueador;95000;Extracto de Ginseng;Harumi Belleza Coreana;Internacional;PROTECCIÓN SOLAR
77;Protector Solar Mineral SPF 50;Cerave;Bloqueador;80000;Óxido de Zinc, Dióxido de Titanio, Ceramidas;Farmacias de Cadena, Supermercados;Internacional;PROTECCIÓN SOLAR
78;10% Niacinamide + 1% Zinc Serum;The Ordinary;Suero;55000;Niacinamida, Zinc;Tiendas Especializadas (Blush-Bar), Importadores;Internacional;SUEROS / TRATAMIENTOS
79;Hyalu B5 Serum;La Roche Posay;Suero;140000;Ácido Hialurónico, Vitamina B5;Farmatodo, Cruz Verde, Medipiel;Internacional;SUEROS / TRATAMIENTOS
80;C-Firma Day Serum;Drunk Elephant;Suero;250000;15% Vitamina C, Ácido Ferúlico;Tiendas Especializadas (Blush-Bar);Internacional;SUEROS / TRATAMIENTOS
81;Revitalift Serum Noche Retinol Puro;L'Oréal Paris;Suero;80000;Retinol Puro, Ácido Hialurónico;Supermercados, Droguerías Masivas;Internacional;SUEROS / TRATAMIENTOS
82;Sérum de Ácido Hialurónico + Péptidos;Montoc (Nacional);Suero;42000;Ácido Hialurónico, Péptidos;Tienda en Línea, Puntos de Venta;Local;SUEROS / TRATAMIENTOS
83;Blemish & Age Defense;Skinceuticals;Suero;290000;Ácido Salicílico, Ácido Glicólico, Ácido Cítrico;Medipiel, Droguerías Especializadas;Internacional;SUEROS / TRATAMIENTOS
84;A.G.E. Interrupter;sesderma;Crema Antiedad;350000;Proxylane, Extracto de Arándano;Medipiel, Droguerías Especializadas;Internacional;SUEROS / TRATAMIENTOS
85;Acglicolic Serum Liposomado;Sesderma;Suero;230000;Ácido Glicólico Liposomado;Tiendas Dermatológicas (Bella Piel);Internacional;SUEROS / TRATAMIENTOS
86;The Rich Cream;Augustinus Bader;Crema;900000;TFC8® (Complejo de Factores de Activación Celular);Tiendas de Lujo, Importadores;Internacional;SUEROS / TRATAMIENTOS
87;Good Genes All-In-One Lactic Acid Treatment;Sunday Riley;Tratamiento;300000;Ácido Láctico;Tiendas Especializadas (Blush-Bar);Internacional;SUEROS / TRATAMIENTOS
88;Retinol 0.5% in Squalane;The Ordinary;Suero;60000;Retinol, Escualano;Tiendas Especializadas (Blush-Bar), Importadores;Internacional;SUEROS / TRATAMIENTOS
89;Mixsoon Soybean Milk Serum;Mixsoon (Coreano);Suero;149000;Extracto de Leche de Soya;Harumi Belleza Coreana;Internacional;SUEROS / TRATAMIENTOS
90;C-Vit Radiance Fluido Luminoso;Sesderma;Fluido;150000;Vitamina C, Extracto de Naranja Dulce;Tiendas Dermatológicas (Bella Piel);Internacional;SUEROS / TRATAMIENTOS
91;Sérum Facial Vitamina C Hydromontoc;Montoc (Nacional);Suero;60800;Vitamina C, Ácido Hialurónico;Tienda en Línea, Puntos de Venta;Local;SUEROS / TRATAMIENTOS
92;Tónico Facial Despigmentante e Iluminador;Kaba (Nacional);Tónico;75000;Ácidos Naturales;MercadoGlam, Tiendas de Belleza;Local;SUEROS / TRATAMIENTOS
93;Suero facial aguacate bioaqua (S-E24-d);Mao cosmetics;Suero;6200;Aceite de Aguacate, Vitamina E;MercadoGlam, Tiendas de Belleza;Local;SUEROS / TRATAMIENTOS
94;La Roche Posay Mela B3 Serum Antimanchas;La Roche Posay;Sérum;192800;10% de Niacinamida (Vitamina B3);Tiendas Propias, Falabella, medipiel, cruz verde, linea estetica;Internacional;SUEROS / TRATAMIENTOS
95;Serum Baba de Caracol, Sábila y Té Verde;Bena;Suero;45000;Baba de Caracol, Aloe Vera, Té Verde;Supermercados, Droguerías Masivas;Local;SUEROS / TRATAMIENTOS
96;Tónico Facial Niacinamida;rose vibes;Tónico;56000;Niacinamida, Rosa, aloe vera, colageno;Tiendas Propias, Falabella;Internacional;SUEROS / TRATAMIENTOS
97;Glow Tonic;Pixi;Tónico;110000;Ácido Glicólico 5%, Aloe Vera, Ginseng;Tiendas Especializadas (Blush-Bar);Internacional;SUEROS / TRATAMIENTOS
98;Serum Facial Antiarrugas La Roche Posay Retinol B3 30 ml;La roche posay;serum;148000;Pure retinol + vitamina B3;Tiendas Propias, Falabella;Internacional;SUEROS / TRATAMIENTOS`;

// Mapeo de imágenes con URLs estables (Amazon/Unsplash/Retailers)
// Se reemplazan las rutas locales (file://) por URLs públicas que el navegador sí puede cargar.
const PRODUCT_IMAGES: Record<string, string> = {
  // Limpiadores
  '1': 'https://m.media-amazon.com/images/I/61u+J6y+R+L._AC_SL1500_.jpg', // Effaclar Gel + M (Amazon Stable)
  '2': 'https://m.media-amazon.com/images/I/61K+Gj-yRLL._AC_SL1500_.jpg', // Eucerin Dermopure
  '3': 'https://m.media-amazon.com/images/I/51wX5y+5GQL._AC_SL1000_.jpg', // La Roche Micro-Exfoliante
  '4': 'https://m.media-amazon.com/images/I/71N5j+4W29L._AC_SL1500_.jpg', // Cerave Foaming Cleanser (Teal)
  '5': 'https://m.media-amazon.com/images/I/61L5Hk9k8+L._AC_SL1000_.jpg', // Cerave SA
  '6': 'https://m.media-amazon.com/images/I/51p+yX-yWDL._AC_SL1000_.jpg', // Bioderma Sensibio Gel
  '7': 'https://www.cruzverde.com.co/on/demandware.static/-/Sites-cruzverde-master-catalog/default/dw1d960767/images/large/127165-gel-limpiador-facial-dhems-piel-mixta-grasa-x-220g.jpg', // Dhems Gel Limpiador (Cruz Verde - Stable)
  '8': 'https://m.media-amazon.com/images/I/61u+J6y+R+L._AC_SL1500_.jpg', // Effaclar Serum
  '9': 'https://m.media-amazon.com/images/I/61+y+K+g+L._AC_SL1500_.jpg', // Mela B3
  '10': 'https://m.media-amazon.com/images/I/61-y+K+g+L._AC_SL1500_.jpg', // Cetaphil Serum
  '11': 'https://m.media-amazon.com/images/I/51w+j2+iK+L._AC_SL1000_.jpg', // The Ordinary Glycolic
  '12': 'https://m.media-amazon.com/images/I/61+y+K+g+L._AC_SL1500_.jpg', // Duo+M
  '13': 'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?auto=format&fit=crop&w=500&q=60', // Dhems Pore
  '14': 'https://m.media-amazon.com/images/I/61K+Gj-yRLL._AC_SL1500_.jpg', // Eucerin Dual
  '15': 'https://m.media-amazon.com/images/I/61S-G+m8+AL._AC_SL1000_.jpg', // Paula's Choice
  '16': 'https://images.unsplash.com/photo-1608248597279-f99d160bfbc8?auto=format&fit=crop&w=500&q=60', // Infinitek
  '17': 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=500&q=60', // Dhems Vit C
  '18': 'https://m.media-amazon.com/images/I/71Ie2A3+QlL._AC_SL1500_.jpg', // Cetaphil Oil
  '19': 'https://m.media-amazon.com/images/I/51p+yX-yWDL._AC_SL1000_.jpg', // Rilastil
  '20': 'https://m.media-amazon.com/images/I/71Ie2A3+QlL._AC_SL1500_.jpg', // Cetaphil Water Gel
  '21': 'https://m.media-amazon.com/images/I/51p+yX-yWDL._AC_SL1000_.jpg', // Bioderma DS
  '22': 'https://m.media-amazon.com/images/I/51p+yX-yWDL._AC_SL1000_.jpg', // Isispharma
  '23': 'https://m.media-amazon.com/images/I/61M6K9XgVcL._AC_SL1500_.jpg', // Cicaplast
  '24': 'https://m.media-amazon.com/images/I/61L5Hk9k8+L._AC_SL1000_.jpg', // Cerave Cream
  '25': 'https://images.unsplash.com/photo-1629198688000-71f23e745b6e?auto=format&fit=crop&w=500&q=60', // Ana Maria
  '26': 'https://m.media-amazon.com/images/I/61M6K9XgVcL._AC_SL1500_.jpg', // Isdin
  '27': 'https://m.media-amazon.com/images/I/61M6K9XgVcL._AC_SL1500_.jpg', // Anthelios
  '28': 'https://m.media-amazon.com/images/I/61M6K9XgVcL._AC_SL1500_.jpg', // Heliocare
  '29': 'https://images.unsplash.com/photo-1556228720-1967439363a0?auto=format&fit=crop&w=500&q=60', // Ana Maria Sun
  '30': 'https://images.unsplash.com/photo-1590156221187-ae933f75b5f2?auto=format&fit=crop&w=500&q=60', // Infinitek Mask
  '31': 'https://m.media-amazon.com/images/I/61M6K9XgVcL._AC_SL1500_.jpg', // Sensibio H2O
  '32': 'https://m.media-amazon.com/images/I/51p+yX-yWDL._AC_SL1000_.jpg', // Sebium
  '33': 'https://m.media-amazon.com/images/I/61M6K9XgVcL._AC_SL1500_.jpg', // Kiehls
  '34': 'https://m.media-amazon.com/images/I/71Ie2A3+QlL._AC_SL1500_.jpg', // Cetaphil Gentle
  '35': 'https://m.media-amazon.com/images/I/61M6K9XgVcL._AC_SL1500_.jpg', // Effaclar H
  '36': 'https://m.media-amazon.com/images/I/61K+Gj-yRLL._AC_SL1500_.jpg', // Eucerin Foam
  '37': 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=500&q=60', // Oboticario
  '38': 'https://m.media-amazon.com/images/I/61M6K9XgVcL._AC_SL1500_.jpg', // Loreal
  '39': 'https://m.media-amazon.com/images/I/71Ie2A3+QlL._AC_SL1500_.jpg', // Cerave Oil
  '40': 'https://m.media-amazon.com/images/I/61M6K9XgVcL._AC_SL1500_.jpg', // Neutrogena
  '41': 'https://images.unsplash.com/photo-1556228720-1967439363a0?auto=format&fit=crop&w=500&q=60', // Ana Maria
  '42': 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=500&q=60', // Botanique
  '43': 'https://m.media-amazon.com/images/I/51p+yX-yWDL._AC_SL1000_.jpg', // SVR Sebiaclear
  '44': 'https://m.media-amazon.com/images/I/61M6K9XgVcL._AC_SL1500_.jpg', // Avene
  '45': 'https://m.media-amazon.com/images/I/61M6K9XgVcL._AC_SL1500_.jpg', // Nivea
  '46': 'https://m.media-amazon.com/images/I/61M6K9XgVcL._AC_SL1500_.jpg', // Loccitane
  '47': 'https://m.media-amazon.com/images/I/61M6K9XgVcL._AC_SL1500_.jpg', // Toleriane
  '48': 'https://m.media-amazon.com/images/I/71Ie2A3+QlL._AC_SL1500_.jpg', // Hydro Boost
  '49': 'https://m.media-amazon.com/images/I/61M6K9XgVcL._AC_SL1500_.jpg', // Vichy
  '50': 'https://m.media-amazon.com/images/I/61M6K9XgVcL._AC_SL1500_.jpg', // Loreal
  '51': 'https://m.media-amazon.com/images/I/61L5Hk9k8+L._AC_SL1000_.jpg', // Cerave PM
  '52': 'https://images.unsplash.com/photo-1629198688000-71f23e745b6e?auto=format&fit=crop&w=500&q=60', // Dermanat
  '53': 'https://m.media-amazon.com/images/I/61K+Gj-yRLL._AC_SL1500_.jpg', // Eucerin
  '54': 'https://m.media-amazon.com/images/I/51p+yX-yWDL._AC_SL1000_.jpg', // Bioderma
  '55': 'https://m.media-amazon.com/images/I/51p+yX-yWDL._AC_SL1000_.jpg', // Bioderma
  '56': 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=500&q=60', // Calendula
  '57': 'https://images.unsplash.com/photo-1556228720-1967439363a0?auto=format&fit=crop&w=500&q=60', // Montoc
  '58': 'https://m.media-amazon.com/images/I/61M6K9XgVcL._AC_SL1500_.jpg', // Nivea
  '59': 'https://m.media-amazon.com/images/I/61M6K9XgVcL._AC_SL1500_.jpg', // Avene
  '60': 'https://m.media-amazon.com/images/I/71Ie2A3+QlL._AC_SL1500_.jpg', // Cetaphil
  '61': 'https://m.media-amazon.com/images/I/71Ie2A3+QlL._AC_SL1500_.jpg', // Lubriderm
  '62': 'https://images.unsplash.com/photo-1556228720-1967439363a0?auto=format&fit=crop&w=500&q=60', // Ana Maria
  '63': 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=500&q=60', // Ana Maria Green
  '64': 'https://m.media-amazon.com/images/I/61K+Gj-yRLL._AC_SL1500_.jpg', // Eucerin
  '65': 'https://m.media-amazon.com/images/I/61M6K9XgVcL._AC_SL1500_.jpg', // FAB
  '66': 'https://m.media-amazon.com/images/I/61M6K9XgVcL._AC_SL1500_.jpg', // Isdin
  '67': 'https://m.media-amazon.com/images/I/61M6K9XgVcL._AC_SL1500_.jpg', // Anthelios
  '68': 'https://m.media-amazon.com/images/I/61M6K9XgVcL._AC_SL1500_.jpg', // Heliocare
  '69': 'https://m.media-amazon.com/images/I/61K+Gj-yRLL._AC_SL1500_.jpg', // Eucerin Sun
  '70': 'https://m.media-amazon.com/images/I/51p+yX-yWDL._AC_SL1000_.jpg', // Bioderma Sun
  '71': 'https://images.unsplash.com/photo-1629198688000-71f23e745b6e?auto=format&fit=crop&w=500&q=60', // Ollie
  '72': 'https://images.unsplash.com/photo-1556228720-1967439363a0?auto=format&fit=crop&w=500&q=60', // Sunface
  '73': 'https://m.media-amazon.com/images/I/61M6K9XgVcL._AC_SL1500_.jpg', // Anthelios XL
  '74': 'https://m.media-amazon.com/images/I/61M6K9XgVcL._AC_SL1500_.jpg', // Vichy
  '75': 'https://m.media-amazon.com/images/I/61M6K9XgVcL._AC_SL1500_.jpg', // Nivea
  '76': 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=500&q=60', // Harumi
  '77': 'https://m.media-amazon.com/images/I/71Ie2A3+QlL._AC_SL1500_.jpg', // Cerave Sun
  '78': 'https://m.media-amazon.com/images/I/51w+j2+iK+L._AC_SL1000_.jpg', // Ordinary
  '79': 'https://m.media-amazon.com/images/I/61u+J6y+R+L._AC_SL1500_.jpg', // Hyalu B5
  '80': 'https://m.media-amazon.com/images/I/61M6K9XgVcL._AC_SL1500_.jpg', // Drunk
  '81': 'https://m.media-amazon.com/images/I/61M6K9XgVcL._AC_SL1500_.jpg', // Loreal
  '82': 'https://images.unsplash.com/photo-1556228720-1967439363a0?auto=format&fit=crop&w=500&q=60', // Montoc
  '83': 'https://m.media-amazon.com/images/I/61M6K9XgVcL._AC_SL1500_.jpg', // Skinceuticals
  '84': 'https://m.media-amazon.com/images/I/61M6K9XgVcL._AC_SL1500_.jpg', // Sesderma
  '85': 'https://m.media-amazon.com/images/I/61M6K9XgVcL._AC_SL1500_.jpg', // Sesderma
  '86': 'https://m.media-amazon.com/images/I/61M6K9XgVcL._AC_SL1500_.jpg', // Bader
  '87': 'https://m.media-amazon.com/images/I/61M6K9XgVcL._AC_SL1500_.jpg', // Sunday Riley
  '88': 'https://m.media-amazon.com/images/I/51w+j2+iK+L._AC_SL1000_.jpg', // Ordinary
  '89': 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=500&q=60', // Mixsoon
  '90': 'https://m.media-amazon.com/images/I/61M6K9XgVcL._AC_SL1500_.jpg', // Sesderma
  '91': 'https://images.unsplash.com/photo-1556228720-1967439363a0?auto=format&fit=crop&w=500&q=60', // Montoc
  '92': 'https://images.unsplash.com/photo-1629198688000-71f23e745b6e?auto=format&fit=crop&w=500&q=60', // Kaba
  '93': 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=500&q=60', // Bioaqua
  '94': 'https://m.media-amazon.com/images/I/61+y+K+g+L._AC_SL1500_.jpg', // Mela B3
  '95': 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=500&q=60', // Bena Green Serum
  '96': 'https://images.unsplash.com/photo-1629198688000-71f23e745b6e?auto=format&fit=crop&w=500&q=60', // Rose Vibes Pink
  '97': 'https://m.media-amazon.com/images/I/61S-G+m8+AL._AC_SL1000_.jpg', // Pixi Glow (Orange Bottle)
  '98': 'https://www.cruzverde.com.co/on/demandware.static/-/Sites-cruzverde-master-catalog/default/dw8374226d/images/large/135914-serum-retinol-b3-la-roche-posay-30-ml.jpg' // Retinol B3 Red Bottle (Cruz Verde Public URL)
};

// Helper to parse the CSV string into objects
export const parseProductsCSV = (csvContent: string = RAW_CSV_DATA): Product[] => {
  const lines = csvContent.trim().split('\n');
  const startIndex = lines[0].toLowerCase().includes('id;') ? 1 : 0;
  
  return lines.slice(startIndex).map((line, index) => {
    if (!line.trim()) return null;
    const values = line.split(';');
    if (values.length < 8) return null;

    const id = values[0]?.trim() || `temp-${index}`;
    const tipo = values[3]?.trim() || 'General';
    const nombre = values[1]?.trim() || 'Desconocido';
    const marca = values[2]?.trim() || '';

    // Generate dynamic placeholder if no specific image exists
    const encodedName = encodeURIComponent(nombre.slice(0, 25));
    // Fallback if PRODUCT_IMAGES has no entry
    const dynamicImage = `https://placehold.co/400x500/FCE7F3/DB2777?text=${encodedName}`;

    return {
      id: id,
      nombre: nombre,
      marca: marca || 'Genérico',
      tipo: tipo,
      precio: parseInt(values[4]?.trim()) || 0,
      ingredientes: values[5]?.trim() || '',
      puntos_venta: values[6]?.trim() || '',
      origen: (values[7]?.trim().toLowerCase() === 'internacional' ? 'internacional' : 'local') as 'local' | 'internacional',
      imageUrl: PRODUCT_IMAGES[id] || dynamicImage
    };
  }).filter((item): item is Product => item !== null);
};

export const SKINCARE_DONTs = [
  { title: "Nunca duermas con maquillaje", desc: "Obstruye los poros y acelera el envejecimiento prematuro." },
  { title: "No explotes tus granitos", desc: "Provoca cicatrices permanentes y extiende la infección." },
  { title: "Evita el agua muy caliente", desc: "Deshidrata la piel y daña la barrera cutánea natural." },
  { title: "No olvides el cuello y escote", desc: "Son zonas que envejecen igual que tu rostro." },
  { title: "Jamás salgas sin bloqueador", desc: "Incluso en días nublados, los rayos UV dañan tu piel." }
];

export const SCIENTIFIC_FACTS = [
    {
        category: "Piel",
        title: "Retinoides y Colágeno",
        text: "Los retinoides tópicos son los únicos ingredientes aprobados por la FDA que han demostrado aumentar la producción de colágeno tipo I y reducir la degradación de la matriz dérmica, revirtiendo el fotoenvejecimiento."
    },
    {
        category: "Cabello",
        title: "Estructura de la Queratina",
        text: "El cabello está compuesto en un 95% por queratina. El calor excesivo (más de 185°C) desnaturaliza estas proteínas, causando la formación de burbujas en la cutícula ('pelo de burbuja') y rotura irreversible."
    },
    {
        category: "Salud",
        title: "Cortisol y Barrera Cutánea",
        text: "El estrés crónico eleva el cortisol, lo que inhibe la síntesis de lípidos (ceramidas) en la epidermis. Esto debilita la barrera cutánea, aumentando la pérdida de agua transepidérmica y la inflamación."
    },
    {
        category: "Uñas",
        title: "Hidratación de la Matriz",
        text: "Las uñas no 'respiran', reciben oxígeno del torrente sanguíneo. Sin embargo, la hidratación de la cutícula y la matriz con aceites ricos en vitamina E previene la onicosquisis (uñas quebradizas en capas)."
    }
];

// --- ANATOMIC ENGINE CONSTANTS (Vector Database V3) ---

export const DIAGNOSTICS_DB: DiagnosticDefinition[] = [
  {
    diagnostico_id: "ROJEZ",
    nombre: "Enrojecimiento/Inflamación",
    etiqueta_cv: "segment_red_channel_high",
    prioridad: 1, 
    producto_aplicar: "Serum Calmante",
    tiempo_focus_seg: 30,
    comando_voz_alerta: "¡ALERTA! Detectamos rojeces. Pausamos el masaje. Aplica el producto Calmante solo en la zona afectada con toques suaves.",
    vector_obligatorio_foco: { x: 0, y: 0, z: 0.5 } // Low XY movement
  },
  {
    diagnostico_id: "FLACIDEZ_PERFIL",
    nombre: "Falta de Tensión en Mandíbula",
    etiqueta_cv: "falta_tension_jawline",
    prioridad: 2,
    producto_aplicar: "Crema Reafirmante",
    tiempo_focus_seg: 90,
    comando_voz_alerta: "Iniciaremos el protocolo de firmeza. Concéntrate en la línea de la mandíbula con movimientos de barrido ascendentes.",
    vector_obligatorio_foco: { x: 1, y: 0.5, z: -1 } // Ascending vector
  }
];

export const SKINCARE_ROUTINES: SkincareRoutine[] = [
  {
    rutina_id: 'anti_edad_manana_v2',
    nombre: 'Protocolo Lifting y Drenaje Matutino',
    descripcion: 'Reduce la hinchazón y define el contorno facial con técnica K-Beauty.',
    categoria: 'LIFTING',
    dificultad: 'Pro',
    isPremium: false,
    total_duracion_seg: 360,
    pasos: [
      {
        orden: 1,
        nombre: 'Limpieza y Preparación',
        producto_asociado: 'Limpiador Facial',
        duracion_seg: 60,
        comando_voz_inicio: "Humedece tu rostro. Inicia con movimientos circulares en la Zona T por un minuto.",
        startLandmarkIndex: 1, // Nose
        endLandmarkIndex: 10, // Forehead
        metricas_calidad: {
          vector_direccion_ideal: [0, 0, 0], // Circular (non-linear)
          tolerancia_vector_max_desviacion: 1.0, 
          velocidad_max_cm_seg: 20,
          presion_ideal_simulada: "MEDIA",
          umbral_error_critico_y: -1
        }
      },
      {
        orden: 2,
        nombre: 'Drenaje Linfático Ojos',
        producto_asociado: 'Contorno de Ojos',
        duracion_seg: 60,
        comando_voz_inicio: "Iniciamos el drenaje. Mueve los dedos suavemente desde el lagrimal hacia las sienes. ¡Muy lento!",
        startLandmarkIndex: 1, 
        endLandmarkIndex: 226, 
        metricas_calidad: {
          vector_direccion_ideal: [0.8, 0.2, 0], 
          tolerancia_vector_max_desviacion: 0.3,
          velocidad_max_cm_seg: 5,
          presion_ideal_simulada: "BAJA",
          umbral_error_critico_y: -0.5
        }
      },
      {
        orden: 3,
        nombre: 'Lifting Muscular Mandíbula',
        producto_asociado: 'Crema Reafirmante',
        duracion_seg: 120,
        comando_voz_inicio: "¡Concentración en la mandíbula! Presiona con firmeza y arrastra el producto desde el mentón hacia la oreja, nunca hacia abajo.",
        startLandmarkIndex: 152, 
        endLandmarkIndex: 454,
        metricas_calidad: {
          vector_direccion_ideal: [0.9, 0.4, 0], 
          tolerancia_vector_max_desviacion: 0.2,
          velocidad_max_cm_seg: 15,
          presion_ideal_simulada: "MEDIA_ALTA",
          umbral_error_critico_y: 0
        }
      }
    ]
  },
  {
    rutina_id: 'drainage-basic',
    nombre: 'Drenaje Detox Básico',
    descripcion: 'Elimina toxinas y líquidos retenidos. Ideal para mañanas hinchadas.',
    categoria: 'DRAINAGE',
    dificultad: 'Beginner',
    isPremium: false,
    total_duracion_seg: 120,
    pasos: [
      {
        orden: 1,
        nombre: 'Apertura de Ganglios',
        producto_asociado: 'Aceite Facial',
        duracion_seg: 30,
        comando_voz_inicio: "Presiona suavemente sobre las clavículas para activar el sistema linfático.",
        startLandmarkIndex: 152, 
        endLandmarkIndex: 152,
        metricas_calidad: {
            vector_direccion_ideal: [0, -1, 0],
            tolerancia_vector_max_desviacion: 0.8,
            velocidad_max_cm_seg: 5,
            presion_ideal_simulada: "MEDIA"
        }
      },
      {
        orden: 2,
        nombre: 'Barrido Mejillas',
        producto_asociado: 'Aceite Facial',
        duracion_seg: 90,
        comando_voz_inicio: "Manos planas, desliza desde la nariz hacia las orejas.",
        startLandmarkIndex: 1, 
        endLandmarkIndex: 454,
        metricas_calidad: {
            vector_direccion_ideal: [1, 0.1, 0],
            tolerancia_vector_max_desviacion: 0.4,
            velocidad_max_cm_seg: 10,
            presion_ideal_simulada: "BAJA"
        }
      }
    ]
  }
];