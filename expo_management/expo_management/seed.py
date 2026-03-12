"""
Expo Management — Complete Seed Data Script
==========================================
Run this command:
  cd ~/expo-management-bench
  bench --site ex.local execute expo_management.expo_management.seed.run_seed
  akhilesh vadakkekkara
"""

import frappe
from frappe.utils import today, add_days


def run_seed():
    frappe.set_user("Administrator")

    print("\n Starting seed data insertion...\n")

    _seed_expo_events()
    _seed_expo_halls()
    _seed_expo_stalls()
    _seed_expo_services()
    _seed_exhibitor_profiles()
    _seed_stall_bookings()
    _seed_crm_leads()

    frappe.db.commit()
    print("\n All seed data inserted successfully!\n")


# ─────────────────────────────────────────────────────────────
# 1. EXPO EVENTS
# ─────────────────────────────────────────────────────────────

def _seed_expo_events():
    print(" Creating Expo Events...")

    events = [
        {
            "doctype": "Expo Event",
            "name": "KTE2026",
            "event_name": "Kerala Tech Expo 2026",
            "event_short_code": "KTE2026",
            "category": "Trade Fair",
            "business_type": "Information Technology",
            "organizer_name": "Kerala IT Mission",
            "description": "<p>Kerala's biggest technology trade fair. 500+ exhibitors from IT, Electronics, and Startups. A must-attend event for tech enthusiasts and businesses.</p>",
            "start_date": add_days(today(), 30),
            "end_date": add_days(today(), 34),
            "setup_start_date": add_days(today(), 28),
            "dismantle_date": add_days(today(), 35),
            "venue_name": "Rajiv Gandhi Indoor Stadium",
            "city": "Kochi",
            "country": "India",
            "status": "Upcoming",
            "is_published": 1,
            "visitor_capacity": 50000,
            "exhibitor_capacity": 500,
            "has_wifi": 1,
            "has_ac": 1,
            "has_food_court": 1,
            "has_atm": 1,
            "has_first_aid": 1,
            "has_fire_safety": 1,
            "has_security": 1,
            "has_drinking_water": 1,
            "has_prayer_room": 1,
            "parking_cars": 2000,
            "parking_trucks": 50,
            "washrooms_male": 20,
            "washrooms_female": 20,
            "washrooms_accessible": 5,
        },
        {
            "doctype": "Expo Event",
            "name": "SIFS2026",
            "event_name": "South India Food Summit 2026",
            "event_short_code": "SIFS2026",
            "category": "Expo",
            "business_type": "Food & Beverage",
            "organizer_name": "FSSAI South India",
            "description": "<p>Premier food and beverage expo covering restaurant tech, packaging, ingredients, and food processing machinery. 300+ brands under one roof.</p>",
            "start_date": add_days(today(), 60),
            "end_date": add_days(today(), 63),
            "setup_start_date": add_days(today(), 58),
            "dismantle_date": add_days(today(), 64),
            "venue_name": "CODISSIA Trade Fair Complex",
            "city": "Coimbatore",
            "country": "India",
            "status": "Upcoming",
            "is_published": 1,
            "visitor_capacity": 30000,
            "exhibitor_capacity": 300,
            "has_wifi": 1,
            "has_ac": 1,
            "has_food_court": 1,
            "has_atm": 1,
            "has_first_aid": 1,
            "has_fire_safety": 1,
            "has_security": 1,
            "has_drinking_water": 1,
            "has_prayer_room": 0,
            "parking_cars": 1500,
            "parking_trucks": 100,
            "washrooms_male": 15,
            "washrooms_female": 15,
            "washrooms_accessible": 4,
        },
        {
            "doctype": "Expo Event",
            "name": "BCON2026",
            "event_name": "Bangalore Build & Construction Expo 2026",
            "event_short_code": "BCON2026",
            "category": "Trade Fair",
            "business_type": "Construction & Real Estate",
            "organizer_name": "CREDAI Karnataka",
            "description": "<p>South India's largest construction and real estate expo. Featuring the latest in building materials, interior design, smart home tech, and architecture.</p>",
            "start_date": add_days(today(), 5),
            "end_date": add_days(today(), 9),
            "setup_start_date": add_days(today(), 3),
            "dismantle_date": add_days(today(), 10),
            "venue_name": "BIEC Convention Centre",
            "city": "Bangalore",
            "country": "India",
            "status": "Ongoing",
            "is_published": 1,
            "visitor_capacity": 40000,
            "exhibitor_capacity": 400,
            "has_wifi": 1,
            "has_ac": 1,
            "has_food_court": 1,
            "has_atm": 1,
            "has_first_aid": 1,
            "has_fire_safety": 1,
            "has_security": 1,
            "has_drinking_water": 1,
            "has_prayer_room": 1,
            "parking_cars": 3000,
            "parking_trucks": 200,
            "washrooms_male": 25,
            "washrooms_female": 25,
            "washrooms_accessible": 6,
        },
    ]

    for event in events:
        if frappe.db.exists("Expo Event", event["name"]):
            print(f"   ⏭  Expo Event '{event['name']}' already exists, skipping.")
            continue
        doc = frappe.get_doc(event)
        doc.insert(ignore_permissions=True)
        print(f"    Created Expo Event: {event['event_name']}")


# ─────────────────────────────────────────────────────────────
# 2. EXPO HALLS
# ─────────────────────────────────────────────────────────────

def _seed_expo_halls():
    print("\n  Creating Expo Halls...")

    halls = [
        # ── KTE2026 Halls ──────────────────────────────────────
        {
            "doctype": "Expo Hall",
            "hall_name": "Hall A – Technology & Startups",
            "hall_code": "KTE2026-HALL-A",
            "expo_event": "KTE2026",
            "hall_type": "AC",
            "area": 8000,
            "ceiling_height": 14,
            "power_capacity": "500 KW",
            "price": 500000,
            "stall_dimensions": [
                {
                    "dimension_label": "3×3",
                    "width": 3, "depth": 3, "area": 9,
                    "base_price": 1200, "corner_premium": 15,
                    "island_premium": 25, "tax_percent": 18,
                    "deposit": 5000, "total_stalls": 80, "available_stalls": 80,
                },
                {
                    "dimension_label": "6×6",
                    "width": 6, "depth": 6, "area": 36,
                    "base_price": 1000, "corner_premium": 15,
                    "island_premium": 20, "tax_percent": 18,
                    "deposit": 15000, "total_stalls": 30, "available_stalls": 30,
                },
                {
                    "dimension_label": "9×9",
                    "width": 9, "depth": 9, "area": 81,
                    "base_price": 900, "corner_premium": 10,
                    "island_premium": 20, "tax_percent": 18,
                    "deposit": 30000, "total_stalls": 10, "available_stalls": 10,
                },
            ],
        },
        {
            "doctype": "Expo Hall",
            "hall_name": "Hall B – Electronics & Hardware",
            "hall_code": "KTE2026-HALL-B",
            "expo_event": "KTE2026",
            "hall_type": "AC",
            "area": 6000,
            "ceiling_height": 12,
            "power_capacity": "400 KW",
            "price": 400000,
            "stall_dimensions": [
                {
                    "dimension_label": "3×3",
                    "width": 3, "depth": 3, "area": 9,
                    "base_price": 1100, "corner_premium": 15,
                    "island_premium": 20, "tax_percent": 18,
                    "deposit": 5000, "total_stalls": 60, "available_stalls": 60,
                },
                {
                    "dimension_label": "6×3",
                    "width": 6, "depth": 3, "area": 18,
                    "base_price": 1000, "corner_premium": 10,
                    "island_premium": 15, "tax_percent": 18,
                    "deposit": 10000, "total_stalls": 25, "available_stalls": 25,
                },
            ],
        },
        # ── SIFS2026 Hall ──────────────────────────────────────
        {
            "doctype": "Expo Hall",
            "hall_name": "Main Pavilion – Food & Beverage",
            "hall_code": "SIFS2026-HALL-A",
            "expo_event": "SIFS2026",
            "hall_type": "AC",
            "area": 10000,
            "ceiling_height": 16,
            "power_capacity": "600 KW",
            "price": 700000,
            "stall_dimensions": [
                {
                    "dimension_label": "3×3",
                    "width": 3, "depth": 3, "area": 9,
                    "base_price": 1300, "corner_premium": 15,
                    "island_premium": 25, "tax_percent": 18,
                    "deposit": 6000, "total_stalls": 100, "available_stalls": 100,
                },
                {
                    "dimension_label": "6×6",
                    "width": 6, "depth": 6, "area": 36,
                    "base_price": 1100, "corner_premium": 15,
                    "island_premium": 20, "tax_percent": 18,
                    "deposit": 18000, "total_stalls": 40, "available_stalls": 40,
                },
                {
                    "dimension_label": "9×6",
                    "width": 9, "depth": 6, "area": 54,
                    "base_price": 1000, "corner_premium": 10,
                    "island_premium": 20, "tax_percent": 18,
                    "deposit": 25000, "total_stalls": 20, "available_stalls": 20,
                },
            ],
        },
        # ── BCON2026 Halls ─────────────────────────────────────
        {
            "doctype": "Expo Hall",
            "hall_name": "Hall 1 – Building Materials",
            "hall_code": "BCON2026-HALL-1",
            "expo_event": "BCON2026",
            "hall_type": "Non-AC",
            "area": 12000,
            "ceiling_height": 18,
            "power_capacity": "800 KW",
            "price": 600000,
            "stall_dimensions": [
                {
                    "dimension_label": "3×3",
                    "width": 3, "depth": 3, "area": 9,
                    "base_price": 900, "corner_premium": 12,
                    "island_premium": 20, "tax_percent": 18,
                    "deposit": 4000, "total_stalls": 120, "available_stalls": 45,
                },
                {
                    "dimension_label": "6×6",
                    "width": 6, "depth": 6, "area": 36,
                    "base_price": 800, "corner_premium": 12,
                    "island_premium": 18, "tax_percent": 18,
                    "deposit": 12000, "total_stalls": 50, "available_stalls": 12,
                },
                {
                    "dimension_label": "12×6",
                    "width": 12, "depth": 6, "area": 72,
                    "base_price": 750, "corner_premium": 10,
                    "island_premium": 15, "tax_percent": 18,
                    "deposit": 30000, "total_stalls": 15, "available_stalls": 3,
                },
            ],
        },
    ]

    for hall in halls:
        if frappe.db.exists("Expo Hall", hall["hall_code"]):
            print(f"   ⏭  Hall '{hall['hall_code']}' already exists, skipping.")
            continue
        doc = frappe.get_doc(hall)
        doc.insert(ignore_permissions=True)
        print(f"    Created Hall: {hall['hall_name']}")


# ─────────────────────────────────────────────────────────────
# 3. EXPO STALLS
# ─────────────────────────────────────────────────────────────

def _seed_expo_stalls():
    print("\n  Creating Expo Stalls...")

    stalls = [
        # KTE2026 – Hall A stalls
        {"stall_number": "A-101", "expo_event": "KTE2026", "expo_hall": "KTE2026-HALL-A", "stall_type": "Corner",   "dimension_label": "3×3", "status": "Available", "base_price": 10800, "final_price": 12420},
        {"stall_number": "A-102", "expo_event": "KTE2026", "expo_hall": "KTE2026-HALL-A", "stall_type": "Standard", "dimension_label": "3×3", "status": "Available", "base_price": 10800, "final_price": 10800},
        {"stall_number": "A-103", "expo_event": "KTE2026", "expo_hall": "KTE2026-HALL-A", "stall_type": "Standard", "dimension_label": "3×3", "status": "Hold",      "base_price": 10800, "final_price": 10800},
        {"stall_number": "A-104", "expo_event": "KTE2026", "expo_hall": "KTE2026-HALL-A", "stall_type": "Standard", "dimension_label": "3×3", "status": "Booked",    "base_price": 10800, "final_price": 10800},
        {"stall_number": "A-201", "expo_event": "KTE2026", "expo_hall": "KTE2026-HALL-A", "stall_type": "Island",   "dimension_label": "6×6", "status": "Available", "base_price": 36000, "final_price": 45000},
        {"stall_number": "A-202", "expo_event": "KTE2026", "expo_hall": "KTE2026-HALL-A", "stall_type": "Standard", "dimension_label": "6×6", "status": "Available", "base_price": 36000, "final_price": 36000},
        {"stall_number": "A-301", "expo_event": "KTE2026", "expo_hall": "KTE2026-HALL-A", "stall_type": "Premium",  "dimension_label": "9×9", "status": "Booked",    "base_price": 72900, "final_price": 80190},
        # KTE2026 – Hall B stalls
        {"stall_number": "B-101", "expo_event": "KTE2026", "expo_hall": "KTE2026-HALL-B", "stall_type": "Corner",   "dimension_label": "3×3", "status": "Available", "base_price": 9900,  "final_price": 11385},
        {"stall_number": "B-102", "expo_event": "KTE2026", "expo_hall": "KTE2026-HALL-B", "stall_type": "Standard", "dimension_label": "3×3", "status": "Available", "base_price": 9900,  "final_price": 9900},
        {"stall_number": "B-103", "expo_event": "KTE2026", "expo_hall": "KTE2026-HALL-B", "stall_type": "Standard", "dimension_label": "3×3", "status": "Booked",    "base_price": 9900,  "final_price": 9900},
        # BCON2026 – Hall 1 stalls (Ongoing event — many booked)
        {"stall_number": "H1-001", "expo_event": "BCON2026", "expo_hall": "BCON2026-HALL-1", "stall_type": "Corner",   "dimension_label": "3×3", "status": "Booked",    "base_price": 8100, "final_price": 9072},
        {"stall_number": "H1-002", "expo_event": "BCON2026", "expo_hall": "BCON2026-HALL-1", "stall_type": "Standard", "dimension_label": "3×3", "status": "Booked",    "base_price": 8100, "final_price": 8100},
        {"stall_number": "H1-003", "expo_event": "BCON2026", "expo_hall": "BCON2026-HALL-1", "stall_type": "Standard", "dimension_label": "3×3", "status": "Booked",    "base_price": 8100, "final_price": 8100},
        {"stall_number": "H1-004", "expo_event": "BCON2026", "expo_hall": "BCON2026-HALL-1", "stall_type": "Standard", "dimension_label": "3×3", "status": "Available", "base_price": 8100, "final_price": 8100},
        {"stall_number": "H1-005", "expo_event": "BCON2026", "expo_hall": "BCON2026-HALL-1", "stall_type": "Standard", "dimension_label": "3×3", "status": "Hold",      "base_price": 8100, "final_price": 8100},
        {"stall_number": "H1-101", "expo_event": "BCON2026", "expo_hall": "BCON2026-HALL-1", "stall_type": "Island",   "dimension_label": "6×6", "status": "Booked",    "base_price": 28800, "final_price": 34000},
        {"stall_number": "H1-102", "expo_event": "BCON2026", "expo_hall": "BCON2026-HALL-1", "stall_type": "Standard", "dimension_label": "6×6", "status": "Available", "base_price": 28800, "final_price": 28800},
    ]

    for stall in stalls:
        stall_id = f"{stall['expo_event']}-{stall['stall_number']}"
        if frappe.db.exists("Expo Stall", stall_id):
            print(f"   ⏭  Stall '{stall_id}' already exists, skipping.")
            continue
        doc = frappe.get_doc({
            "doctype": "Expo Stall",
            "stall_number":    stall["stall_number"],
            "expo_event":      stall["expo_event"],
            "expo_hall":       stall["expo_hall"],
            "stall_type":      stall["stall_type"],
            "dimension_label": stall["dimension_label"],
            "status":          stall["status"],
            "base_price":      stall["base_price"],
            "final_price":     stall["final_price"],
            "tax_percent":     18,
        })
        doc.insert(ignore_permissions=True)
    print(f"    Created {len(stalls)} Expo Stalls")


# ─────────────────────────────────────────────────────────────
# 4. EXPO SERVICES
# ─────────────────────────────────────────────────────────────

def _seed_expo_services():
    print("\n  Creating Expo Services...")

    services = [
        # KTE2026 Services
        {
            "doctype": "Expo Service",
            "service_name": "KTE2026-Additional Power Load",
            "expo_event": "KTE2026",
            "category": "Electricity",
            "description": "Additional power up to 5KW for heavy equipment",
            "charge_type": "One-time",
            "price": 5000,
            "tax_percent": 18,
            "is_mandatory": 0,
            "vendor_name": "Kerala Electricals Ltd",
        },
        {
            "doctype": "Expo Service",
            "service_name": "KTE2026-Booth Fabrication",
            "expo_event": "KTE2026",
            "category": "Branding",
            "description": "Complete stall fabrication with panels, lighting, and signage",
            "charge_type": "Per Stall",
            "price": 18000,
            "tax_percent": 18,
            "is_mandatory": 0,
            "vendor_name": "Expo Builders Kochi",
        },
        {
            "doctype": "Expo Service",
            "service_name": "KTE2026-Internet Line",
            "expo_event": "KTE2026",
            "category": "IT",
            "description": "Dedicated 50 Mbps broadband line for your stall",
            "charge_type": "Per Day",
            "price": 2000,
            "tax_percent": 18,
            "is_mandatory": 0,
        },
        {
            "doctype": "Expo Service",
            "service_name": "KTE2026-Extra Chairs",
            "expo_event": "KTE2026",
            "category": "Furniture",
            "description": "Set of 4 premium folding chairs",
            "charge_type": "One-time",
            "price": 800,
            "tax_percent": 18,
            "is_mandatory": 0,
        },
        {
            "doctype": "Expo Service",
            "service_name": "KTE2026-Branding Standee",
            "expo_event": "KTE2026",
            "category": "Branding",
            "description": "6ft retractable standee with printing",
            "charge_type": "One-time",
            "price": 1500,
            "tax_percent": 18,
            "is_mandatory": 0,
        },
        # SIFS2026 Services
        {
            "doctype": "Expo Service",
            "service_name": "SIFS2026-Refrigeration Unit",
            "expo_event": "SIFS2026",
            "category": "Electricity",
            "description": "Commercial refrigeration unit for food display",
            "charge_type": "Per Day",
            "price": 3000,
            "tax_percent": 18,
            "is_mandatory": 0,
        },
        {
            "doctype": "Expo Service",
            "service_name": "SIFS2026-Cooking Demonstration Setup",
            "expo_event": "SIFS2026",
            "category": "Logistics",
            "description": "Live cooking demo counter with exhaust",
            "charge_type": "One-time",
            "price": 12000,
            "tax_percent": 18,
            "is_mandatory": 0,
        },
        {
            "doctype": "Expo Service",
            "service_name": "SIFS2026-Additional Power Load",
            "expo_event": "SIFS2026",
            "category": "Electricity",
            "description": "Extra power for cooking equipment",
            "charge_type": "One-time",
            "price": 6000,
            "tax_percent": 18,
            "is_mandatory": 0,
        },
        # BCON2026 Services
        {
            "doctype": "Expo Service",
            "service_name": "BCON2026-Heavy Machinery Handling",
            "expo_event": "BCON2026",
            "category": "Logistics",
            "description": "Forklift and crane service for heavy exhibits",
            "charge_type": "One-time",
            "price": 8000,
            "tax_percent": 18,
            "is_mandatory": 0,
            "vendor_name": "Bangalore Cargo Services",
        },
        {
            "doctype": "Expo Service",
            "service_name": "BCON2026-Additional Power Load",
            "expo_event": "BCON2026",
            "category": "Electricity",
            "description": "Extra power up to 10KW for machinery demos",
            "charge_type": "One-time",
            "price": 7000,
            "tax_percent": 18,
            "is_mandatory": 0,
        },
    ]

    for svc in services:
        if frappe.db.exists("Expo Service", svc["service_name"]):
            print(f"   ⏭  Service '{svc['service_name']}' already exists, skipping.")
            continue
        doc = frappe.get_doc(svc)
        doc.insert(ignore_permissions=True)

    print(f"    Created {len(services)} Expo Services")


# ─────────────────────────────────────────────────────────────
# 5. EXHIBITOR PROFILES
# ─────────────────────────────────────────────────────────────

def _seed_exhibitor_profiles():
    print("\n  Creating Exhibitor Profiles...")

    exhibitors = [
        {
            "doctype": "Exhibitor Profile",
            "exhibitor_name": "Rahul Menon",
            "company_name": "TechSpark Solutions",
            "industry": "Information Technology",
            "gst_number": "32AABCT1234A1Z5",
            "annual_turnover": "1-5 Cr",
            "contact_number": "+919876543210",
            "email": "rahul@techspark.in",
            "website": "https://techspark.in",
            "communication_address": "Infopark, Kakkanad, Kochi - 682030",
            "product_categories": "SaaS, Mobile Apps, Cloud Solutions",
            "description": "TechSpark is a leading IT solutions provider specializing in enterprise SaaS products and mobile app development.",
            "expo_event": "KTE2026",
            "status": "Active",
        },
        {
            "doctype": "Exhibitor Profile",
            "exhibitor_name": "Priya Nair",
            "company_name": "DataViz Analytics",
            "industry": "Data Science & AI",
            "gst_number": "32AABCD5678A1Z3",
            "annual_turnover": "Below 1 Cr",
            "contact_number": "+919123456789",
            "email": "priya@dataviz.io",
            "website": "https://dataviz.io",
            "communication_address": "Technopark Phase 3, Trivandrum - 695581",
            "product_categories": "AI Tools, Data Analytics, Business Intelligence",
            "description": "DataViz provides cutting-edge AI-powered analytics solutions for enterprises.",
            "expo_event": "KTE2026",
            "status": "Active",
        },
        {
            "doctype": "Exhibitor Profile",
            "exhibitor_name": "Anoop Krishnan",
            "company_name": "ByteForge Labs",
            "industry": "Hardware & IoT",
            "gst_number": "32AABCB9012A1Z1",
            "annual_turnover": "1-5 Cr",
            "contact_number": "+919988776655",
            "email": "anoop@byteforge.in",
            "website": "https://byteforge.in",
            "communication_address": "SmartCity Kochi, Kakkanad - 682037",
            "product_categories": "IoT Devices, Embedded Systems, Robotics",
            "description": "ByteForge Labs designs innovative IoT and embedded systems for industrial automation.",
            "expo_event": "KTE2026",
            "status": "Active",
        },
        {
            "doctype": "Exhibitor Profile",
            "exhibitor_name": "Suresh Kumar",
            "company_name": "Spice Garden Foods",
            "industry": "Food & Beverage",
            "gst_number": "33AABCS3456A1Z2",
            "annual_turnover": "5-25 Cr",
            "contact_number": "+919765432100",
            "email": "suresh@spicegarden.com",
            "website": "https://spicegarden.com",
            "communication_address": "SIPCOT Industrial Area, Coimbatore - 641021",
            "product_categories": "Spice Blends, Ready-to-cook, Organic Foods",
            "description": "Spice Garden Foods is a heritage brand offering authentic South Indian spice blends and ready-to-cook products.",
            "expo_event": "SIFS2026",
            "status": "Active",
        },
        {
            "doctype": "Exhibitor Profile",
            "exhibitor_name": "Meena Iyer",
            "company_name": "FreshPack Industries",
            "industry": "Food Packaging",
            "gst_number": "33AABCF7890A1Z4",
            "annual_turnover": "1-5 Cr",
            "contact_number": "+919845001122",
            "email": "meena@freshpack.in",
            "website": "https://freshpack.in",
            "communication_address": "Peelamedu, Coimbatore - 641004",
            "product_categories": "Eco Packaging, Vacuum Packs, Food Containers",
            "description": "FreshPack provides sustainable and innovative food packaging solutions.",
            "expo_event": "SIFS2026",
            "status": "Pending Approval",
        },
        {
            "doctype": "Exhibitor Profile",
            "exhibitor_name": "Ramesh Gowda",
            "company_name": "StoneCraft Builders",
            "industry": "Construction Materials",
            "gst_number": "29AABCS1122A1Z6",
            "annual_turnover": "5-25 Cr",
            "contact_number": "+919900112233",
            "email": "ramesh@stonecraft.co.in",
            "website": "https://stonecraft.co.in",
            "communication_address": "Peenya Industrial Area, Bangalore - 560058",
            "product_categories": "Granite, Marble, Tiles, Stone Cladding",
            "description": "StoneCraft specializes in premium natural stone products for residential and commercial construction.",
            "expo_event": "BCON2026",
            "status": "Active",
        },
        {
            "doctype": "Exhibitor Profile",
            "exhibitor_name": "Kavitha Reddy",
            "company_name": "SmartHome Interiors",
            "industry": "Interior Design & Smart Home",
            "gst_number": "29AABCR4455A1Z8",
            "annual_turnover": "1-5 Cr",
            "contact_number": "+919812233445",
            "email": "kavitha@smarthome.in",
            "website": "https://smarthomeinteriors.in",
            "communication_address": "Whitefield, Bangalore - 560066",
            "product_categories": "Smart Lighting, Home Automation, Modular Furniture",
            "description": "SmartHome Interiors brings cutting-edge home automation and design solutions.",
            "expo_event": "BCON2026",
            "status": "Active",
        },
    ]

    for ex in exhibitors:
        if frappe.db.exists("Exhibitor Profile", ex["email"]):
            print(f"   ⏭  Exhibitor '{ex['company_name']}' already exists, skipping.")
            continue
        doc = frappe.get_doc(ex)
        doc.insert(ignore_permissions=True)

    print(f"    Created {len(exhibitors)} Exhibitor Profiles")


# ─────────────────────────────────────────────────────────────
# 6. STALL BOOKINGS
# ─────────────────────────────────────────────────────────────

def _seed_stall_bookings():
    print("\n  Creating Stall Bookings...")

    bookings = [
        {
            "expo_event":      "BCON2026",
            "exhibitor":       "ramesh@stonecraft.co.in",
            "stall":           "BCON2026-H1-001",
            "payment_status":  "Paid",
            "base_amount":     9072,
            "tax_amount":      1632.96,
            "total_amount":    10704.96,
            "deposit_paid":    4000,
        },
        {
            "expo_event":      "BCON2026",
            "exhibitor":       "kavitha@smarthome.in",
            "stall":           "BCON2026-H1-101",
            "payment_status":  "Partial",
            "base_amount":     34000,
            "tax_amount":      6120,
            "total_amount":    40120,
            "deposit_paid":    12000,
        },
        {
            "expo_event":      "KTE2026",
            "exhibitor":       "rahul@techspark.in",
            "stall":           "KTE2026-A-104",
            "payment_status":  "Pending",
            "base_amount":     10800,
            "tax_amount":      1944,
            "total_amount":    12744,
            "deposit_paid":    5000,
        },
    ]

    for bk in bookings:
        # Check stall exists
        if not frappe.db.exists("Expo Stall", bk["stall"]):
            print(f"     Stall '{bk['stall']}' not found, skipping booking.")
            continue

        doc = frappe.get_doc({
            "doctype":        "Stall Booking",
            "expo_event":     bk["expo_event"],
            "exhibitor":      bk["exhibitor"],
            "stall":          bk["stall"],
            "booking_date":   today(),
            "payment_status": bk["payment_status"],
            "base_amount":    bk["base_amount"],
            "tax_amount":     bk["tax_amount"],
            "total_amount":   bk["total_amount"],
            "deposit_paid":   bk["deposit_paid"],
            "balance_due":    bk["total_amount"] - bk["deposit_paid"],
        })
        doc.insert(ignore_permissions=True)

    print(f"    Created {len(bookings)} Stall Bookings")


# ─────────────────────────────────────────────────────────────
# 7. CRM LEADS
# ─────────────────────────────────────────────────────────────

def _seed_crm_leads():
    print("\n  Creating CRM Leads...")

    leads = [
        {
            "lead_name": "Arun Pillai",
            "company": "NexGen Robotics",
            "expo_event": "KTE2026",
            "contact_number": "+919876001234",
            "email": "arun@nexgenrobotics.com",
            "country": "India",
            "product_interest": "IoT Devices, Robotics",
            "lead_source": "Manual",
            "lead_rating": "Hot",
            "exhibitor": "anoop@byteforge.in",
            "follow_up_date": add_days(today(), 3),
            "notes": "<p>Very interested in bulk IoT order. Schedule demo call this week.</p>",
        },
        {
            "lead_name": "Sandra Thomas",
            "company": "Kerala Startups Hub",
            "expo_event": "KTE2026",
            "contact_number": "+919988001122",
            "email": "sandra@keralastartuphub.in",
            "country": "India",
            "product_interest": "SaaS Platform, Cloud Solutions",
            "lead_source": "Scan",
            "lead_rating": "Warm",
            "exhibitor": "rahul@techspark.in",
            "follow_up_date": add_days(today(), 7),
            "notes": "<p>Interested in annual subscription. Send pricing deck.</p>",
        },
        {
            "lead_name": "Mohammed Fazil",
            "company": "Gulf Trade Connect",
            "expo_event": "KTE2026",
            "contact_number": "+919765009988",
            "email": "fazil@gulftrade.ae",
            "country": "United Arab Emirates",
            "product_interest": "AI Analytics Tools",
            "lead_source": "Meeting",
            "lead_rating": "Hot",
            "exhibitor": "priya@dataviz.io",
            "follow_up_date": add_days(today(), 2),
            "notes": "<p>UAE government project. Very high potential. Priority follow-up.</p>",
        },
        {
            "lead_name": "Deepa Narayanan",
            "company": "FoodTech Ventures",
            "expo_event": "SIFS2026",
            "contact_number": "+919900223344",
            "email": "deepa@foodtechventures.in",
            "country": "India",
            "product_interest": "Spice Blends, Organic Products",
            "lead_source": "Manual",
            "lead_rating": "Warm",
            "exhibitor": "suresh@spicegarden.com",
            "follow_up_date": add_days(today(), 10),
            "notes": "<p>Looking to source organic spices for restaurant chain. 200+ outlets.</p>",
        },
        {
            "lead_name": "Sanjay Mehta",
            "company": "Prestige Constructions",
            "expo_event": "BCON2026",
            "contact_number": "+919811223344",
            "email": "sanjay@prestigeconstructions.in",
            "country": "India",
            "product_interest": "Granite, Premium Tiles",
            "lead_source": "Scan",
            "lead_rating": "Hot",
            "exhibitor": "ramesh@stonecraft.co.in",
            "follow_up_date": add_days(today(), 1),
            "notes": "<p>3 upcoming luxury villa projects. Needs granite quote for 15,000 sqft.</p>",
        },
        {
            "lead_name": "Ritu Sharma",
            "company": "Urban Nest Developers",
            "expo_event": "BCON2026",
            "contact_number": "+919845667788",
            "email": "ritu@urbannest.in",
            "country": "India",
            "product_interest": "Smart Lighting, Home Automation",
            "lead_source": "Meeting",
            "lead_rating": "Cold",
            "exhibitor": "kavitha@smarthome.in",
            "follow_up_date": add_days(today(), 14),
            "notes": "<p>Early stage inquiry. Budget not confirmed yet.</p>",
        },
    ]

    for lead in leads:
        doc = frappe.get_doc({
            "doctype":        "CRM Lead",
            "lead_name":      lead["lead_name"],
            "company":        lead["company"],
            "expo_event":     lead["expo_event"],
            "contact_number": lead["contact_number"],
            "email":          lead["email"],
            "country":        lead.get("country"),
            "product_interest": lead["product_interest"],
            "lead_source":    lead["lead_source"],
            "lead_rating":    lead["lead_rating"],
            "exhibitor":      lead["exhibitor"],
            "follow_up_date": lead["follow_up_date"],
            "notes":          lead["notes"],
        })
        doc.insert(ignore_permissions=True)

    print(f"    Created {len(leads)} CRM Leads")


def clean_seed():
    frappe.set_user("Administrator")
    for dt in ["CRM Lead", "Stall Booking", "Exhibitor Profile", "Expo Service", "Expo Stall", "Expo Hall", "Expo Event"]:
        frappe.db.sql(f"DELETE FROM `tab{dt}`")
    frappe.db.commit()
    print(" Cleaned!")