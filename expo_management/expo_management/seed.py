"""
Expo Management — Complete Seed Data Script
==========================================
Run:
  bench --site ex.local execute expo_management.expo_management.seed.run_seed

Clean all:
  bench --site ex.local execute expo_management.expo_management.seed.clean_seed

Clean only new 3 events:
  bench --site ex.local execute expo_management.expo_management.seed.clean_extra_seed
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
        # ── Original 3 ────────────────────────────────────────
        {
            "doctype": "Expo Event",
            "name": "KTE2026",
            "event_name": "Kerala Tech Expo 2026",
            "event_short_code": "KTE2026",
            "category": "Trade Fair",
            "business_type": "Information Technology",
            "organizer_name": "Kerala IT Mission",
            "description": "<p>Kerala's biggest technology trade fair. 500+ exhibitors from IT, Electronics, and Startups.</p>",
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
            "has_wifi": 1, "has_ac": 1, "has_food_court": 1, "has_atm": 1,
            "has_first_aid": 1, "has_fire_safety": 1, "has_security": 1,
            "has_drinking_water": 1, "has_prayer_room": 1,
            "parking_cars": 2000, "parking_trucks": 50,
            "washrooms_male": 20, "washrooms_female": 20, "washrooms_accessible": 5,
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
            "has_wifi": 1, "has_ac": 1, "has_food_court": 1, "has_atm": 1,
            "has_first_aid": 1, "has_fire_safety": 1, "has_security": 1,
            "has_drinking_water": 1, "has_prayer_room": 0,
            "parking_cars": 1500, "parking_trucks": 100,
            "washrooms_male": 15, "washrooms_female": 15, "washrooms_accessible": 4,
        },
        {
            "doctype": "Expo Event",
            "name": "BCON2026",
            "event_name": "Bangalore Build & Construction Expo 2026",
            "event_short_code": "BCON2026",
            "category": "Trade Fair",
            "business_type": "Construction & Real Estate",
            "organizer_name": "CREDAI Karnataka",
            "description": "<p>South India's largest construction and real estate expo. Building materials, interior design, smart home tech, and architecture.</p>",
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
            "has_wifi": 1, "has_ac": 1, "has_food_court": 1, "has_atm": 1,
            "has_first_aid": 1, "has_fire_safety": 1, "has_security": 1,
            "has_drinking_water": 1, "has_prayer_room": 1,
            "parking_cars": 3000, "parking_trucks": 200,
            "washrooms_male": 25, "washrooms_female": 25, "washrooms_accessible": 6,
        },
        # ── New 3 ──────────────────────────────────────────────
        {
            "doctype": "Expo Event",
            "name": "HMCE2026",
            "event_name": "Healthcare & Medical Expo 2026",
            "event_short_code": "HMCE2026",
            "category": "Expo",
            "business_type": "Healthcare & Pharmaceuticals",
            "organizer_name": "Indian Medical Association – Kerala",
            "description": "<p>South India's premier healthcare and medical devices expo. 400+ exhibitors covering diagnostics, pharma, medical equipment, telemedicine, and hospital management systems.</p>",
            "start_date": add_days(today(), 45),
            "end_date": add_days(today(), 49),
            "setup_start_date": add_days(today(), 43),
            "dismantle_date": add_days(today(), 50),
            "venue_name": "Lakeshore Convention Centre",
            "city": "Kochi",
            "country": "India",
            "status": "Upcoming",
            "is_published": 1,
            "visitor_capacity": 35000,
            "exhibitor_capacity": 400,
            "has_wifi": 1, "has_ac": 1, "has_food_court": 1, "has_atm": 1,
            "has_first_aid": 1, "has_fire_safety": 1, "has_security": 1,
            "has_drinking_water": 1, "has_prayer_room": 1,
            "parking_cars": 2500, "parking_trucks": 40,
            "washrooms_male": 18, "washrooms_female": 18, "washrooms_accessible": 6,
        },
        {
            "doctype": "Expo Event",
            "name": "AGRIINDIA2026",
            "event_name": "AgroIndia Expo 2026",
            "event_short_code": "AGRIINDIA2026",
            "category": "Trade Fair",
            "business_type": "Agriculture & Allied Industries",
            "organizer_name": "NABARD – National Agriculture Expo Cell",
            "description": "<p>India's leading agri-business expo connecting farmers, agri-tech startups, equipment manufacturers, and agro-processing companies. Features live farm machinery demos, drone showcases, and a dedicated organic produce pavilion.</p>",
            "start_date": add_days(today(), 75),
            "end_date": add_days(today(), 80),
            "setup_start_date": add_days(today(), 73),
            "dismantle_date": add_days(today(), 81),
            "venue_name": "Hyderabad Exhibition Grounds",
            "city": "Hyderabad",
            "country": "India",
            "status": "Upcoming",
            "is_published": 1,
            "visitor_capacity": 60000,
            "exhibitor_capacity": 600,
            "has_wifi": 1, "has_ac": 0, "has_food_court": 1, "has_atm": 1,
            "has_first_aid": 1, "has_fire_safety": 1, "has_security": 1,
            "has_drinking_water": 1, "has_prayer_room": 1,
            "parking_cars": 5000, "parking_trucks": 300,
            "washrooms_male": 30, "washrooms_female": 30, "washrooms_accessible": 8,
        },
        {
            "doctype": "Expo Event",
            "name": "EDUTECH2026",
            "event_name": "EduTech South 2026",
            "event_short_code": "EDUTECH2026",
            "category": "Conference",
            "business_type": "Education & EdTech",
            "organizer_name": "All India Council for Technical Education",
            "description": "<p>South India's largest education technology expo and conference. 250+ exhibitors from e-learning, ed-tech platforms, school infrastructure, higher education, and skill development.</p>",
            "start_date": add_days(today(), 20),
            "end_date": add_days(today(), 22),
            "setup_start_date": add_days(today(), 18),
            "dismantle_date": add_days(today(), 23),
            "venue_name": "Chennai Trade Centre",
            "city": "Chennai",
            "country": "India",
            "status": "Upcoming",
            "is_published": 1,
            "visitor_capacity": 20000,
            "exhibitor_capacity": 250,
            "has_wifi": 1, "has_ac": 1, "has_food_court": 1, "has_atm": 1,
            "has_first_aid": 1, "has_fire_safety": 1, "has_security": 1,
            "has_drinking_water": 1, "has_prayer_room": 0,
            "parking_cars": 1200, "parking_trucks": 20,
            "washrooms_male": 12, "washrooms_female": 12, "washrooms_accessible": 4,
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
        # ── KTE2026 ────────────────────────────────────────────
        {
            "doctype": "Expo Hall",
            "hall_name": "Hall A – Technology & Startups",
            "hall_code": "KTE2026-HALL-A",
            "expo_event": "KTE2026",
            "hall_type": "AC",
            "area": 8000, "ceiling_height": 14,
            "power_capacity": "500 KW", "price": 500000,
            "stall_dimensions": [
                {"dimension_label": "3×3", "width": 3, "depth": 3, "area": 9, "base_price": 1200, "corner_premium": 15, "island_premium": 25, "tax_percent": 18, "deposit": 5000, "total_stalls": 80, "available_stalls": 80},
                {"dimension_label": "6×6", "width": 6, "depth": 6, "area": 36, "base_price": 1000, "corner_premium": 15, "island_premium": 20, "tax_percent": 18, "deposit": 15000, "total_stalls": 30, "available_stalls": 30},
                {"dimension_label": "9×9", "width": 9, "depth": 9, "area": 81, "base_price": 900, "corner_premium": 10, "island_premium": 20, "tax_percent": 18, "deposit": 30000, "total_stalls": 10, "available_stalls": 10},
            ],
        },
        {
            "doctype": "Expo Hall",
            "hall_name": "Hall B – Electronics & Hardware",
            "hall_code": "KTE2026-HALL-B",
            "expo_event": "KTE2026",
            "hall_type": "AC",
            "area": 6000, "ceiling_height": 12,
            "power_capacity": "400 KW", "price": 400000,
            "stall_dimensions": [
                {"dimension_label": "3×3", "width": 3, "depth": 3, "area": 9, "base_price": 1100, "corner_premium": 15, "island_premium": 20, "tax_percent": 18, "deposit": 5000, "total_stalls": 60, "available_stalls": 60},
                {"dimension_label": "6×3", "width": 6, "depth": 3, "area": 18, "base_price": 1000, "corner_premium": 10, "island_premium": 15, "tax_percent": 18, "deposit": 10000, "total_stalls": 25, "available_stalls": 25},
            ],
        },
        # ── SIFS2026 ───────────────────────────────────────────
        {
            "doctype": "Expo Hall",
            "hall_name": "Main Pavilion – Food & Beverage",
            "hall_code": "SIFS2026-HALL-A",
            "expo_event": "SIFS2026",
            "hall_type": "AC",
            "area": 10000, "ceiling_height": 16,
            "power_capacity": "600 KW", "price": 700000,
            "stall_dimensions": [
                {"dimension_label": "3×3", "width": 3, "depth": 3, "area": 9, "base_price": 1300, "corner_premium": 15, "island_premium": 25, "tax_percent": 18, "deposit": 6000, "total_stalls": 100, "available_stalls": 100},
                {"dimension_label": "6×6", "width": 6, "depth": 6, "area": 36, "base_price": 1100, "corner_premium": 15, "island_premium": 20, "tax_percent": 18, "deposit": 18000, "total_stalls": 40, "available_stalls": 40},
                {"dimension_label": "9×6", "width": 9, "depth": 6, "area": 54, "base_price": 1000, "corner_premium": 10, "island_premium": 20, "tax_percent": 18, "deposit": 25000, "total_stalls": 20, "available_stalls": 20},
            ],
        },
        # ── BCON2026 ───────────────────────────────────────────
        {
            "doctype": "Expo Hall",
            "hall_name": "Hall 1 – Building Materials",
            "hall_code": "BCON2026-HALL-1",
            "expo_event": "BCON2026",
            "hall_type": "Non-AC",
            "area": 12000, "ceiling_height": 18,
            "power_capacity": "800 KW", "price": 600000,
            "stall_dimensions": [
                {"dimension_label": "3×3", "width": 3, "depth": 3, "area": 9, "base_price": 900, "corner_premium": 12, "island_premium": 20, "tax_percent": 18, "deposit": 4000, "total_stalls": 120, "available_stalls": 45},
                {"dimension_label": "6×6", "width": 6, "depth": 6, "area": 36, "base_price": 800, "corner_premium": 12, "island_premium": 18, "tax_percent": 18, "deposit": 12000, "total_stalls": 50, "available_stalls": 12},
                {"dimension_label": "12×6", "width": 12, "depth": 6, "area": 72, "base_price": 750, "corner_premium": 10, "island_premium": 15, "tax_percent": 18, "deposit": 30000, "total_stalls": 15, "available_stalls": 3},
            ],
        },
        # ── HMCE2026 ───────────────────────────────────────────
        {
            "doctype": "Expo Hall",
            "hall_name": "Hall M1 – Medical Devices & Diagnostics",
            "hall_code": "HMCE2026-HALL-M1",
            "expo_event": "HMCE2026",
            "hall_type": "AC",
            "area": 7000, "ceiling_height": 13,
            "power_capacity": "450 KW", "price": 550000,
            "stall_dimensions": [
                {"dimension_label": "3×3", "width": 3, "depth": 3, "area": 9, "base_price": 1400, "corner_premium": 15, "island_premium": 25, "tax_percent": 18, "deposit": 6000, "total_stalls": 70, "available_stalls": 70},
                {"dimension_label": "6×6", "width": 6, "depth": 6, "area": 36, "base_price": 1200, "corner_premium": 15, "island_premium": 20, "tax_percent": 18, "deposit": 20000, "total_stalls": 25, "available_stalls": 25},
                {"dimension_label": "9×6", "width": 9, "depth": 6, "area": 54, "base_price": 1100, "corner_premium": 10, "island_premium": 20, "tax_percent": 18, "deposit": 35000, "total_stalls": 8, "available_stalls": 8},
            ],
        },
        {
            "doctype": "Expo Hall",
            "hall_name": "Hall M2 – Pharma & Hospital Management",
            "hall_code": "HMCE2026-HALL-M2",
            "expo_event": "HMCE2026",
            "hall_type": "AC",
            "area": 5000, "ceiling_height": 12,
            "power_capacity": "300 KW", "price": 400000,
            "stall_dimensions": [
                {"dimension_label": "3×3", "width": 3, "depth": 3, "area": 9, "base_price": 1350, "corner_premium": 15, "island_premium": 20, "tax_percent": 18, "deposit": 6000, "total_stalls": 55, "available_stalls": 55},
                {"dimension_label": "6×3", "width": 6, "depth": 3, "area": 18, "base_price": 1200, "corner_premium": 10, "island_premium": 15, "tax_percent": 18, "deposit": 12000, "total_stalls": 20, "available_stalls": 20},
            ],
        },
        # ── AGRIINDIA2026 ──────────────────────────────────────
        {
            "doctype": "Expo Hall",
            "hall_name": "Pavilion A – Farm Machinery & Equipment",
            "hall_code": "AGRIINDIA2026-HALL-A",
            "expo_event": "AGRIINDIA2026",
            "hall_type": "Non-AC",
            "area": 15000, "ceiling_height": 20,
            "power_capacity": "1000 KW", "price": 800000,
            "stall_dimensions": [
                {"dimension_label": "6×6", "width": 6, "depth": 6, "area": 36, "base_price": 850, "corner_premium": 12, "island_premium": 18, "tax_percent": 18, "deposit": 10000, "total_stalls": 80, "available_stalls": 80},
                {"dimension_label": "12×9", "width": 12, "depth": 9, "area": 108, "base_price": 750, "corner_premium": 10, "island_premium": 15, "tax_percent": 18, "deposit": 40000, "total_stalls": 20, "available_stalls": 20},
                {"dimension_label": "18×12", "width": 18, "depth": 12, "area": 216, "base_price": 700, "corner_premium": 8, "island_premium": 12, "tax_percent": 18, "deposit": 80000, "total_stalls": 5, "available_stalls": 5},
            ],
        },
        {
            "doctype": "Expo Hall",
            "hall_name": "Pavilion B – Seeds, Fertilizers & AgriTech",
            "hall_code": "AGRIINDIA2026-HALL-B",
            "expo_event": "AGRIINDIA2026",
            "hall_type": "Non-AC",
            "area": 10000, "ceiling_height": 16,
            "power_capacity": "600 KW", "price": 500000,
            "stall_dimensions": [
                {"dimension_label": "3×3", "width": 3, "depth": 3, "area": 9, "base_price": 700, "corner_premium": 12, "island_premium": 18, "tax_percent": 18, "deposit": 4000, "total_stalls": 100, "available_stalls": 100},
                {"dimension_label": "6×6", "width": 6, "depth": 6, "area": 36, "base_price": 650, "corner_premium": 10, "island_premium": 15, "tax_percent": 18, "deposit": 10000, "total_stalls": 40, "available_stalls": 40},
            ],
        },
        # ── EDUTECH2026 ────────────────────────────────────────
        {
            "doctype": "Expo Hall",
            "hall_name": "Hall E1 – EdTech Platforms & e-Learning",
            "hall_code": "EDUTECH2026-HALL-E1",
            "expo_event": "EDUTECH2026",
            "hall_type": "AC",
            "area": 5000, "ceiling_height": 11,
            "power_capacity": "250 KW", "price": 350000,
            "stall_dimensions": [
                {"dimension_label": "3×3", "width": 3, "depth": 3, "area": 9, "base_price": 1100, "corner_premium": 15, "island_premium": 20, "tax_percent": 18, "deposit": 5000, "total_stalls": 60, "available_stalls": 60},
                {"dimension_label": "6×3", "width": 6, "depth": 3, "area": 18, "base_price": 1000, "corner_premium": 12, "island_premium": 18, "tax_percent": 18, "deposit": 10000, "total_stalls": 20, "available_stalls": 20},
            ],
        },
        {
            "doctype": "Expo Hall",
            "hall_name": "Hall E2 – School Infrastructure & Skills",
            "hall_code": "EDUTECH2026-HALL-E2",
            "expo_event": "EDUTECH2026",
            "hall_type": "AC",
            "area": 4000, "ceiling_height": 11,
            "power_capacity": "200 KW", "price": 280000,
            "stall_dimensions": [
                {"dimension_label": "3×3", "width": 3, "depth": 3, "area": 9, "base_price": 1050, "corner_premium": 15, "island_premium": 20, "tax_percent": 18, "deposit": 5000, "total_stalls": 50, "available_stalls": 50},
                {"dimension_label": "6×6", "width": 6, "depth": 6, "area": 36, "base_price": 950, "corner_premium": 12, "island_premium": 18, "tax_percent": 18, "deposit": 15000, "total_stalls": 15, "available_stalls": 15},
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
        # ── KTE2026 Hall A ─────────────────────────────────────
        {"stall_number": "A-101", "expo_event": "KTE2026", "expo_hall": "KTE2026-HALL-A", "stall_type": "Corner",   "dimension_label": "3×3", "status": "Available", "base_price": 10800, "final_price": 12420},
        {"stall_number": "A-102", "expo_event": "KTE2026", "expo_hall": "KTE2026-HALL-A", "stall_type": "Standard", "dimension_label": "3×3", "status": "Available", "base_price": 10800, "final_price": 10800},
        {"stall_number": "A-103", "expo_event": "KTE2026", "expo_hall": "KTE2026-HALL-A", "stall_type": "Standard", "dimension_label": "3×3", "status": "Hold",      "base_price": 10800, "final_price": 10800},
        {"stall_number": "A-104", "expo_event": "KTE2026", "expo_hall": "KTE2026-HALL-A", "stall_type": "Standard", "dimension_label": "3×3", "status": "Booked",    "base_price": 10800, "final_price": 10800},
        {"stall_number": "A-201", "expo_event": "KTE2026", "expo_hall": "KTE2026-HALL-A", "stall_type": "Island",   "dimension_label": "6×6", "status": "Available", "base_price": 36000, "final_price": 45000},
        {"stall_number": "A-202", "expo_event": "KTE2026", "expo_hall": "KTE2026-HALL-A", "stall_type": "Standard", "dimension_label": "6×6", "status": "Available", "base_price": 36000, "final_price": 36000},
        {"stall_number": "A-301", "expo_event": "KTE2026", "expo_hall": "KTE2026-HALL-A", "stall_type": "Premium",  "dimension_label": "9×9", "status": "Booked",    "base_price": 72900, "final_price": 80190},
        # ── KTE2026 Hall B ─────────────────────────────────────
        {"stall_number": "B-101", "expo_event": "KTE2026", "expo_hall": "KTE2026-HALL-B", "stall_type": "Corner",   "dimension_label": "3×3", "status": "Available", "base_price": 9900,  "final_price": 11385},
        {"stall_number": "B-102", "expo_event": "KTE2026", "expo_hall": "KTE2026-HALL-B", "stall_type": "Standard", "dimension_label": "3×3", "status": "Available", "base_price": 9900,  "final_price": 9900},
        {"stall_number": "B-103", "expo_event": "KTE2026", "expo_hall": "KTE2026-HALL-B", "stall_type": "Standard", "dimension_label": "3×3", "status": "Booked",    "base_price": 9900,  "final_price": 9900},
        # ── BCON2026 Hall 1 ────────────────────────────────────
        {"stall_number": "H1-001", "expo_event": "BCON2026", "expo_hall": "BCON2026-HALL-1", "stall_type": "Corner",   "dimension_label": "3×3", "status": "Booked",    "base_price": 8100,  "final_price": 9072},
        {"stall_number": "H1-002", "expo_event": "BCON2026", "expo_hall": "BCON2026-HALL-1", "stall_type": "Standard", "dimension_label": "3×3", "status": "Booked",    "base_price": 8100,  "final_price": 8100},
        {"stall_number": "H1-003", "expo_event": "BCON2026", "expo_hall": "BCON2026-HALL-1", "stall_type": "Standard", "dimension_label": "3×3", "status": "Booked",    "base_price": 8100,  "final_price": 8100},
        {"stall_number": "H1-004", "expo_event": "BCON2026", "expo_hall": "BCON2026-HALL-1", "stall_type": "Standard", "dimension_label": "3×3", "status": "Available", "base_price": 8100,  "final_price": 8100},
        {"stall_number": "H1-005", "expo_event": "BCON2026", "expo_hall": "BCON2026-HALL-1", "stall_type": "Standard", "dimension_label": "3×3", "status": "Hold",      "base_price": 8100,  "final_price": 8100},
        {"stall_number": "H1-101", "expo_event": "BCON2026", "expo_hall": "BCON2026-HALL-1", "stall_type": "Island",   "dimension_label": "6×6", "status": "Booked",    "base_price": 28800, "final_price": 34000},
        {"stall_number": "H1-102", "expo_event": "BCON2026", "expo_hall": "BCON2026-HALL-1", "stall_type": "Standard", "dimension_label": "6×6", "status": "Available", "base_price": 28800, "final_price": 28800},
        # ── HMCE2026 Hall M1 ───────────────────────────────────
        {"stall_number": "M1-101", "expo_event": "HMCE2026", "expo_hall": "HMCE2026-HALL-M1", "stall_type": "Corner",   "dimension_label": "3×3", "status": "Available", "base_price": 12600, "final_price": 14490},
        {"stall_number": "M1-102", "expo_event": "HMCE2026", "expo_hall": "HMCE2026-HALL-M1", "stall_type": "Standard", "dimension_label": "3×3", "status": "Available", "base_price": 12600, "final_price": 12600},
        {"stall_number": "M1-103", "expo_event": "HMCE2026", "expo_hall": "HMCE2026-HALL-M1", "stall_type": "Standard", "dimension_label": "3×3", "status": "Hold",      "base_price": 12600, "final_price": 12600},
        {"stall_number": "M1-104", "expo_event": "HMCE2026", "expo_hall": "HMCE2026-HALL-M1", "stall_type": "Standard", "dimension_label": "3×3", "status": "Available", "base_price": 12600, "final_price": 12600},
        {"stall_number": "M1-201", "expo_event": "HMCE2026", "expo_hall": "HMCE2026-HALL-M1", "stall_type": "Island",   "dimension_label": "6×6", "status": "Available", "base_price": 43200, "final_price": 54000},
        {"stall_number": "M1-202", "expo_event": "HMCE2026", "expo_hall": "HMCE2026-HALL-M1", "stall_type": "Standard", "dimension_label": "6×6", "status": "Booked",    "base_price": 43200, "final_price": 43200},
        {"stall_number": "M1-301", "expo_event": "HMCE2026", "expo_hall": "HMCE2026-HALL-M1", "stall_type": "Premium",  "dimension_label": "9×6", "status": "Available", "base_price": 59400, "final_price": 65340},
        # ── HMCE2026 Hall M2 ───────────────────────────────────
        {"stall_number": "M2-101", "expo_event": "HMCE2026", "expo_hall": "HMCE2026-HALL-M2", "stall_type": "Corner",   "dimension_label": "3×3", "status": "Available", "base_price": 12150, "final_price": 13973},
        {"stall_number": "M2-102", "expo_event": "HMCE2026", "expo_hall": "HMCE2026-HALL-M2", "stall_type": "Standard", "dimension_label": "3×3", "status": "Available", "base_price": 12150, "final_price": 12150},
        {"stall_number": "M2-103", "expo_event": "HMCE2026", "expo_hall": "HMCE2026-HALL-M2", "stall_type": "Standard", "dimension_label": "6×3", "status": "Booked",    "base_price": 21600, "final_price": 21600},
        # ── AGRIINDIA2026 Pavilion A ───────────────────────────
        {"stall_number": "PA-101", "expo_event": "AGRIINDIA2026", "expo_hall": "AGRIINDIA2026-HALL-A", "stall_type": "Corner",   "dimension_label": "6×6",   "status": "Available", "base_price": 30600,  "final_price": 34272},
        {"stall_number": "PA-102", "expo_event": "AGRIINDIA2026", "expo_hall": "AGRIINDIA2026-HALL-A", "stall_type": "Standard", "dimension_label": "6×6",   "status": "Available", "base_price": 30600,  "final_price": 30600},
        {"stall_number": "PA-103", "expo_event": "AGRIINDIA2026", "expo_hall": "AGRIINDIA2026-HALL-A", "stall_type": "Standard", "dimension_label": "6×6",   "status": "Hold",      "base_price": 30600,  "final_price": 30600},
        {"stall_number": "PA-201", "expo_event": "AGRIINDIA2026", "expo_hall": "AGRIINDIA2026-HALL-A", "stall_type": "Island",   "dimension_label": "12×9",  "status": "Available", "base_price": 81000,  "final_price": 93150},
        {"stall_number": "PA-202", "expo_event": "AGRIINDIA2026", "expo_hall": "AGRIINDIA2026-HALL-A", "stall_type": "Standard", "dimension_label": "12×9",  "status": "Available", "base_price": 81000,  "final_price": 81000},
        {"stall_number": "PA-301", "expo_event": "AGRIINDIA2026", "expo_hall": "AGRIINDIA2026-HALL-A", "stall_type": "Premium",  "dimension_label": "18×12", "status": "Booked",    "base_price": 151200, "final_price": 169344},
        # ── AGRIINDIA2026 Pavilion B ───────────────────────────
        {"stall_number": "PB-101", "expo_event": "AGRIINDIA2026", "expo_hall": "AGRIINDIA2026-HALL-B", "stall_type": "Corner",   "dimension_label": "3×3",  "status": "Available", "base_price": 6300,  "final_price": 7056},
        {"stall_number": "PB-102", "expo_event": "AGRIINDIA2026", "expo_hall": "AGRIINDIA2026-HALL-B", "stall_type": "Standard", "dimension_label": "3×3",  "status": "Available", "base_price": 6300,  "final_price": 6300},
        {"stall_number": "PB-103", "expo_event": "AGRIINDIA2026", "expo_hall": "AGRIINDIA2026-HALL-B", "stall_type": "Standard", "dimension_label": "3×3",  "status": "Booked",    "base_price": 6300,  "final_price": 6300},
        {"stall_number": "PB-201", "expo_event": "AGRIINDIA2026", "expo_hall": "AGRIINDIA2026-HALL-B", "stall_type": "Standard", "dimension_label": "6×6",  "status": "Available", "base_price": 23400, "final_price": 23400},
        # ── EDUTECH2026 Hall E1 ────────────────────────────────
        {"stall_number": "E1-101", "expo_event": "EDUTECH2026", "expo_hall": "EDUTECH2026-HALL-E1", "stall_type": "Corner",   "dimension_label": "3×3", "status": "Available", "base_price": 9900,  "final_price": 11385},
        {"stall_number": "E1-102", "expo_event": "EDUTECH2026", "expo_hall": "EDUTECH2026-HALL-E1", "stall_type": "Standard", "dimension_label": "3×3", "status": "Available", "base_price": 9900,  "final_price": 9900},
        {"stall_number": "E1-103", "expo_event": "EDUTECH2026", "expo_hall": "EDUTECH2026-HALL-E1", "stall_type": "Standard", "dimension_label": "3×3", "status": "Hold",      "base_price": 9900,  "final_price": 9900},
        {"stall_number": "E1-104", "expo_event": "EDUTECH2026", "expo_hall": "EDUTECH2026-HALL-E1", "stall_type": "Standard", "dimension_label": "3×3", "status": "Booked",    "base_price": 9900,  "final_price": 9900},
        {"stall_number": "E1-201", "expo_event": "EDUTECH2026", "expo_hall": "EDUTECH2026-HALL-E1", "stall_type": "Island",   "dimension_label": "6×3", "status": "Available", "base_price": 18000, "final_price": 21600},
        {"stall_number": "E1-202", "expo_event": "EDUTECH2026", "expo_hall": "EDUTECH2026-HALL-E1", "stall_type": "Standard", "dimension_label": "6×3", "status": "Available", "base_price": 18000, "final_price": 18000},
        # ── EDUTECH2026 Hall E2 ────────────────────────────────
        {"stall_number": "E2-101", "expo_event": "EDUTECH2026", "expo_hall": "EDUTECH2026-HALL-E2", "stall_type": "Corner",   "dimension_label": "3×3", "status": "Available", "base_price": 9450,  "final_price": 10868},
        {"stall_number": "E2-102", "expo_event": "EDUTECH2026", "expo_hall": "EDUTECH2026-HALL-E2", "stall_type": "Standard", "dimension_label": "3×3", "status": "Booked",    "base_price": 9450,  "final_price": 9450},
        {"stall_number": "E2-201", "expo_event": "EDUTECH2026", "expo_hall": "EDUTECH2026-HALL-E2", "stall_type": "Island",   "dimension_label": "6×6", "status": "Available", "base_price": 34200, "final_price": 41040},
    ]

    for stall in stalls:
        stall_id = f"{stall['expo_event']}-{stall['stall_number']}"
        if frappe.db.exists("Expo Stall", stall_id):
            print(f"   ⏭  Stall '{stall_id}' already exists, skipping.")
            continue
        doc = frappe.get_doc({
            "doctype":         "Expo Stall",
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
        # ── KTE2026 ────────────────────────────────────────────
        {"doctype": "Expo Service", "service_name": "KTE2026-Additional Power Load",   "expo_event": "KTE2026",      "category": "Electricity", "description": "Additional power up to 5KW for heavy equipment",                        "charge_type": "One-time",  "price": 5000,  "tax_percent": 18, "is_mandatory": 0, "vendor_name": "Kerala Electricals Ltd"},
        {"doctype": "Expo Service", "service_name": "KTE2026-Booth Fabrication",        "expo_event": "KTE2026",      "category": "Branding",    "description": "Complete stall fabrication with panels, lighting, and signage",        "charge_type": "Per Stall", "price": 18000, "tax_percent": 18, "is_mandatory": 0, "vendor_name": "Expo Builders Kochi"},
        {"doctype": "Expo Service", "service_name": "KTE2026-Internet Line",            "expo_event": "KTE2026",      "category": "IT",          "description": "Dedicated 50 Mbps broadband line for your stall",                      "charge_type": "Per Day",   "price": 2000,  "tax_percent": 18, "is_mandatory": 0},
        {"doctype": "Expo Service", "service_name": "KTE2026-Extra Chairs",             "expo_event": "KTE2026",      "category": "Furniture",   "description": "Set of 4 premium folding chairs",                                      "charge_type": "One-time",  "price": 800,   "tax_percent": 18, "is_mandatory": 0},
        {"doctype": "Expo Service", "service_name": "KTE2026-Branding Standee",         "expo_event": "KTE2026",      "category": "Branding",    "description": "6ft retractable standee with printing",                                "charge_type": "One-time",  "price": 1500,  "tax_percent": 18, "is_mandatory": 0},
        # ── SIFS2026 ───────────────────────────────────────────
        {"doctype": "Expo Service", "service_name": "SIFS2026-Refrigeration Unit",      "expo_event": "SIFS2026",     "category": "Electricity", "description": "Commercial refrigeration unit for food display",                       "charge_type": "Per Day",   "price": 3000,  "tax_percent": 18, "is_mandatory": 0},
        {"doctype": "Expo Service", "service_name": "SIFS2026-Cooking Demo Setup",      "expo_event": "SIFS2026",     "category": "Logistics",   "description": "Live cooking demo counter with exhaust",                               "charge_type": "One-time",  "price": 12000, "tax_percent": 18, "is_mandatory": 0},
        {"doctype": "Expo Service", "service_name": "SIFS2026-Additional Power Load",   "expo_event": "SIFS2026",     "category": "Electricity", "description": "Extra power for cooking equipment",                                    "charge_type": "One-time",  "price": 6000,  "tax_percent": 18, "is_mandatory": 0},
        # ── BCON2026 ───────────────────────────────────────────
        {"doctype": "Expo Service", "service_name": "BCON2026-Heavy Machinery Handling","expo_event": "BCON2026",     "category": "Logistics",   "description": "Forklift and crane service for heavy exhibits",                        "charge_type": "One-time",  "price": 8000,  "tax_percent": 18, "is_mandatory": 0, "vendor_name": "Bangalore Cargo Services"},
        {"doctype": "Expo Service", "service_name": "BCON2026-Additional Power Load",   "expo_event": "BCON2026",     "category": "Electricity", "description": "Extra power up to 10KW for machinery demos",                           "charge_type": "One-time",  "price": 7000,  "tax_percent": 18, "is_mandatory": 0},
        # ── HMCE2026 ───────────────────────────────────────────
        {"doctype": "Expo Service", "service_name": "HMCE2026-Medical Gas Supply",      "expo_event": "HMCE2026",     "category": "Logistics",   "description": "Piped oxygen/nitrogen for medical device demos",                       "charge_type": "Per Day",   "price": 4000,  "tax_percent": 18, "is_mandatory": 0, "vendor_name": "MedGas Kerala"},
        {"doctype": "Expo Service", "service_name": "HMCE2026-Cold Chain Storage",      "expo_event": "HMCE2026",     "category": "Logistics",   "description": "Refrigerated storage unit for pharma samples",                         "charge_type": "Per Day",   "price": 3500,  "tax_percent": 18, "is_mandatory": 0},
        {"doctype": "Expo Service", "service_name": "HMCE2026-Additional Power Load",   "expo_event": "HMCE2026",     "category": "Electricity", "description": "Extra 3 KW power for imaging / diagnostic equipment",                  "charge_type": "One-time",  "price": 5500,  "tax_percent": 18, "is_mandatory": 0},
        {"doctype": "Expo Service", "service_name": "HMCE2026-Demo Counter Setup",      "expo_event": "HMCE2026",     "category": "Branding",    "description": "Branded demo counter with backlit panel",                              "charge_type": "One-time",  "price": 14000, "tax_percent": 18, "is_mandatory": 0},
        {"doctype": "Expo Service", "service_name": "HMCE2026-Internet Line",           "expo_event": "HMCE2026",     "category": "IT",          "description": "Dedicated 100 Mbps line for live device demos",                        "charge_type": "Per Day",   "price": 2500,  "tax_percent": 18, "is_mandatory": 0},
        # ── AGRIINDIA2026 ──────────────────────────────────────
        {"doctype": "Expo Service", "service_name": "AGRIINDIA2026-Heavy Machinery Unloading",  "expo_event": "AGRIINDIA2026", "category": "Logistics",   "description": "Crane and flatbed service for tractors and harvesters",   "charge_type": "One-time", "price": 12000, "tax_percent": 18, "is_mandatory": 0, "vendor_name": "Hyderabad Heavy Movers"},
        {"doctype": "Expo Service", "service_name": "AGRIINDIA2026-Drip Irrigation Demo Kit",   "expo_event": "AGRIINDIA2026", "category": "Logistics",   "description": "Complete drip system demo setup with water supply",        "charge_type": "One-time", "price": 8000,  "tax_percent": 18, "is_mandatory": 0},
        {"doctype": "Expo Service", "service_name": "AGRIINDIA2026-Additional Power Load",       "expo_event": "AGRIINDIA2026", "category": "Electricity", "description": "Extra 10 KW for machinery demonstrations",                "charge_type": "One-time", "price": 9000,  "tax_percent": 18, "is_mandatory": 0},
        {"doctype": "Expo Service", "service_name": "AGRIINDIA2026-Drone Demo Permit",           "expo_event": "AGRIINDIA2026", "category": "Logistics",   "description": "Clearance and designated zone for drone flying demo",     "charge_type": "One-time", "price": 5000,  "tax_percent": 18, "is_mandatory": 0},
        {"doctype": "Expo Service", "service_name": "AGRIINDIA2026-Produce Display Stand",       "expo_event": "AGRIINDIA2026", "category": "Branding",    "description": "Dedicated display stand for soil samples and produce",    "charge_type": "One-time", "price": 3500,  "tax_percent": 18, "is_mandatory": 0},
        # ── EDUTECH2026 ────────────────────────────────────────
        {"doctype": "Expo Service", "service_name": "EDUTECH2026-Display Screen Rental",  "expo_event": "EDUTECH2026", "category": "IT",          "description": "65-inch 4K display with mounting stand for demos",          "charge_type": "Per Day",   "price": 3000,  "tax_percent": 18, "is_mandatory": 0},
        {"doctype": "Expo Service", "service_name": "EDUTECH2026-Internet Line",           "expo_event": "EDUTECH2026", "category": "IT",          "description": "Dedicated 50 Mbps line for live platform demos",            "charge_type": "Per Day",   "price": 1800,  "tax_percent": 18, "is_mandatory": 0},
        {"doctype": "Expo Service", "service_name": "EDUTECH2026-Branding Standee",        "expo_event": "EDUTECH2026", "category": "Branding",    "description": "6ft retractable standee with full-colour printing",         "charge_type": "One-time",  "price": 1400,  "tax_percent": 18, "is_mandatory": 0},
        {"doctype": "Expo Service", "service_name": "EDUTECH2026-Workshop Room Booking",   "expo_event": "EDUTECH2026", "category": "Logistics",   "description": "30-seat workshop room with projector – half day",           "charge_type": "One-time",  "price": 10000, "tax_percent": 18, "is_mandatory": 0},
        {"doctype": "Expo Service", "service_name": "EDUTECH2026-Additional Power Load",   "expo_event": "EDUTECH2026", "category": "Electricity", "description": "Extra power for multiple demo laptops and screens",         "charge_type": "One-time",  "price": 3000,  "tax_percent": 18, "is_mandatory": 0},
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
        # ── KTE2026 ────────────────────────────────────────────
        {"doctype": "Exhibitor Profile", "exhibitor_name": "Rahul Menon",    "company_name": "TechSpark Solutions",   "industry": "Information Technology",         "gst_number": "32AABCT1234A1Z5", "annual_turnover": "1-5 Cr",      "contact_number": "+919876543210", "email": "rahul@techspark.in",        "website": "https://techspark.in",          "communication_address": "Infopark, Kakkanad, Kochi - 682030",           "product_categories": "SaaS, Mobile Apps, Cloud Solutions",            "description": "TechSpark is a leading IT solutions provider specializing in enterprise SaaS products and mobile app development.", "expo_event": "KTE2026",      "status": "Active"},
        {"doctype": "Exhibitor Profile", "exhibitor_name": "Priya Nair",     "company_name": "DataViz Analytics",     "industry": "Data Science & AI",              "gst_number": "32AABCD5678A1Z3", "annual_turnover": "Below 1 Cr",  "contact_number": "+919123456789", "email": "priya@dataviz.io",          "website": "https://dataviz.io",            "communication_address": "Technopark Phase 3, Trivandrum - 695581",      "product_categories": "AI Tools, Data Analytics, Business Intelligence","description": "DataViz provides cutting-edge AI-powered analytics solutions for enterprises.",                                    "expo_event": "KTE2026",      "status": "Active"},
        {"doctype": "Exhibitor Profile", "exhibitor_name": "Anoop Krishnan", "company_name": "ByteForge Labs",        "industry": "Hardware & IoT",                 "gst_number": "32AABCB9012A1Z1", "annual_turnover": "1-5 Cr",      "contact_number": "+919988776655", "email": "anoop@byteforge.in",        "website": "https://byteforge.in",          "communication_address": "SmartCity Kochi, Kakkanad - 682037",           "product_categories": "IoT Devices, Embedded Systems, Robotics",       "description": "ByteForge Labs designs innovative IoT and embedded systems for industrial automation.",                            "expo_event": "KTE2026",      "status": "Active"},
        # ── SIFS2026 ───────────────────────────────────────────
        {"doctype": "Exhibitor Profile", "exhibitor_name": "Suresh Kumar",   "company_name": "Spice Garden Foods",    "industry": "Food & Beverage",                "gst_number": "33AABCS3456A1Z2", "annual_turnover": "5-25 Cr",     "contact_number": "+919765432100", "email": "suresh@spicegarden.com",    "website": "https://spicegarden.com",       "communication_address": "SIPCOT Industrial Area, Coimbatore - 641021", "product_categories": "Spice Blends, Ready-to-cook, Organic Foods",    "description": "Spice Garden Foods is a heritage brand offering authentic South Indian spice blends and ready-to-cook products.",   "expo_event": "SIFS2026",     "status": "Active"},
        {"doctype": "Exhibitor Profile", "exhibitor_name": "Meena Iyer",     "company_name": "FreshPack Industries",  "industry": "Food Packaging",                 "gst_number": "33AABCF7890A1Z4", "annual_turnover": "1-5 Cr",      "contact_number": "+919845001122", "email": "meena@freshpack.in",        "website": "https://freshpack.in",          "communication_address": "Peelamedu, Coimbatore - 641004",               "product_categories": "Eco Packaging, Vacuum Packs, Food Containers",  "description": "FreshPack provides sustainable and innovative food packaging solutions.",                                           "expo_event": "SIFS2026",     "status": "Pending Approval"},
        # ── BCON2026 ───────────────────────────────────────────
        {"doctype": "Exhibitor Profile", "exhibitor_name": "Ramesh Gowda",   "company_name": "StoneCraft Builders",   "industry": "Construction Materials",         "gst_number": "29AABCS1122A1Z6", "annual_turnover": "5-25 Cr",     "contact_number": "+919900112233", "email": "ramesh@stonecraft.co.in",   "website": "https://stonecraft.co.in",      "communication_address": "Peenya Industrial Area, Bangalore - 560058",  "product_categories": "Granite, Marble, Tiles, Stone Cladding",        "description": "StoneCraft specializes in premium natural stone products for residential and commercial construction.",             "expo_event": "BCON2026",     "status": "Active"},
        {"doctype": "Exhibitor Profile", "exhibitor_name": "Kavitha Reddy",  "company_name": "SmartHome Interiors",   "industry": "Interior Design & Smart Home",   "gst_number": "29AABCR4455A1Z8", "annual_turnover": "1-5 Cr",      "contact_number": "+919812233445", "email": "kavitha@smarthome.in",      "website": "https://smarthomeinteriors.in", "communication_address": "Whitefield, Bangalore - 560066",               "product_categories": "Smart Lighting, Home Automation, Modular Furniture","description": "SmartHome Interiors brings cutting-edge home automation and design solutions.",                                    "expo_event": "BCON2026",     "status": "Active"},
        # ── HMCE2026 ───────────────────────────────────────────
        {"doctype": "Exhibitor Profile", "exhibitor_name": "Dr. Anil Kumar", "company_name": "MediScan Diagnostics",  "industry": "Medical Devices",                "gst_number": "32AABCM1234A1Z9", "annual_turnover": "5-25 Cr",     "contact_number": "+919876500001", "email": "anil@mediscan.in",          "website": "https://mediscan.in",           "communication_address": "Lakeshore Hospital Complex, Kochi - 682304",  "product_categories": "MRI Equipment, Ultrasound, Portable Diagnostics","description": "MediScan is a leading distributor of advanced diagnostic imaging equipment for hospitals and clinics.",             "expo_event": "HMCE2026",     "status": "Active"},
        {"doctype": "Exhibitor Profile", "exhibitor_name": "Roshni George",  "company_name": "HealthTech Solutions",  "industry": "Healthcare IT",                  "gst_number": "32AABCH5678A1Z7", "annual_turnover": "1-5 Cr",      "contact_number": "+919876500002", "email": "roshni@healthtech.in",      "website": "https://healthtech.in",         "communication_address": "Infopark Campus 2, Kochi - 682303",           "product_categories": "Hospital Management System, Telemedicine, EHR",  "description": "HealthTech builds cloud-based hospital management and telemedicine platforms for mid-sized hospitals.",             "expo_event": "HMCE2026",     "status": "Active"},
        {"doctype": "Exhibitor Profile", "exhibitor_name": "Faisal Rahman",  "company_name": "PharmaCure Distributors","industry": "Pharmaceuticals",               "gst_number": "32AABCP9012A1Z5", "annual_turnover": "25-100 Cr",   "contact_number": "+919876500003", "email": "faisal@pharmacure.in",      "website": "https://pharmacure.in",         "communication_address": "Edappally, Kochi - 682024",                    "product_categories": "Generic Medicines, OTC Products, Nutraceuticals","description": "PharmaCure is a multi-state pharma distributor with a network of 2000+ pharmacies.",                               "expo_event": "HMCE2026",     "status": "Active"},
        # ── AGRIINDIA2026 ──────────────────────────────────────
        {"doctype": "Exhibitor Profile", "exhibitor_name": "Venkatesh Reddy","company_name": "AgroForce Machinery",   "industry": "Agricultural Equipment",         "gst_number": "36AABCA1234A1Z2", "annual_turnover": "5-25 Cr",     "contact_number": "+919876500004", "email": "venkatesh@agroforce.in",    "website": "https://agroforce.in",          "communication_address": "IDA Nacharam, Hyderabad - 500076",             "product_categories": "Tractors, Mini Harvesters, Soil Tillers, Sprayers","description": "AgroForce manufactures affordable precision farming machinery tailored for small and mid-sized Indian farms.",       "expo_event": "AGRIINDIA2026", "status": "Active"},
        {"doctype": "Exhibitor Profile", "exhibitor_name": "Lakshmi Devi",   "company_name": "GreenRoot Organics",    "industry": "Organic Farming",                "gst_number": "36AABCG5678A1Z0", "annual_turnover": "Below 1 Cr",  "contact_number": "+919876500005", "email": "lakshmi@greenroot.in",      "website": "https://greenrootorganics.in",  "communication_address": "Warangal Rural, Telangana - 506167",           "product_categories": "Organic Seeds, Bio Fertilizers, Natural Pesticides","description": "GreenRoot Organics is a farmer-led collective producing certified organic inputs.",                                 "expo_event": "AGRIINDIA2026", "status": "Active"},
        {"doctype": "Exhibitor Profile", "exhibitor_name": "Mohan Das",      "company_name": "SkyFarm Drones",        "industry": "AgriTech",                       "gst_number": "36AABCS3456A1Z8", "annual_turnover": "1-5 Cr",      "contact_number": "+919876500006", "email": "mohan@skyfarmdrones.in",    "website": "https://skyfarmdrones.in",      "communication_address": "T-Hub, HICC Complex, Hyderabad - 500081",     "product_categories": "Agricultural Drones, Precision Spraying, Crop Monitoring","description": "SkyFarm Drones builds autonomous drones for precision crop spraying and real-time field monitoring.",              "expo_event": "AGRIINDIA2026", "status": "Pending Approval"},
        # ── EDUTECH2026 ────────────────────────────────────────
        {"doctype": "Exhibitor Profile", "exhibitor_name": "Ananya Krishnaswamy","company_name": "LearnSphere EdTech","industry": "Education Technology",            "gst_number": "33AABCL1234A1Z3", "annual_turnover": "1-5 Cr",      "contact_number": "+919876500007", "email": "ananya@learnsphere.in",     "website": "https://learnsphere.in",        "communication_address": "Sholinganallur, Chennai - 600119",             "product_categories": "Adaptive Learning Platform, STEM Kits, Online Tutoring","description": "LearnSphere builds AI-driven adaptive learning platforms for K-12 and competitive exam preparation.",              "expo_event": "EDUTECH2026",  "status": "Active"},
        {"doctype": "Exhibitor Profile", "exhibitor_name": "Karthikeyan S",  "company_name": "SkillBridge Academy",   "industry": "Vocational Training",            "gst_number": "33AABCS7890A1Z1", "annual_turnover": "Below 1 Cr",  "contact_number": "+919876500008", "email": "karthik@skillbridge.in",    "website": "https://skillbridge.in",        "communication_address": "Anna Nagar, Chennai - 600040",                 "product_categories": "Coding Bootcamps, Skill Certification, Campus Hiring","description": "SkillBridge runs industry-aligned coding and vocational bootcamps with guaranteed placement support.",              "expo_event": "EDUTECH2026",  "status": "Active"},
        {"doctype": "Exhibitor Profile", "exhibitor_name": "Deepa Sundaram", "company_name": "ClassRoom Connect",     "industry": "School Infrastructure",          "gst_number": "33AABCC4567A1Z9", "annual_turnover": "5-25 Cr",     "contact_number": "+919876500009", "email": "deepa@classroomconnect.in", "website": "https://classroomconnect.in",   "communication_address": "OMR Road, Perungudi, Chennai - 600096",        "product_categories": "Smart Boards, AV Systems, Language Labs, Furniture","description": "ClassRoom Connect supplies complete smart classroom infrastructure to schools and colleges across South India.",    "expo_event": "EDUTECH2026",  "status": "Active"},
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
        # ── Original ───────────────────────────────────────────
        {"expo_event": "BCON2026",      "exhibitor": "ramesh@stonecraft.co.in",   "stall": "BCON2026-H1-001",      "payment_status": "Paid",    "base_amount": 9072,   "tax_amount": 1632.96, "total_amount": 10704.96, "deposit_paid": 4000},
        {"expo_event": "BCON2026",      "exhibitor": "kavitha@smarthome.in",      "stall": "BCON2026-H1-101",      "payment_status": "Partial", "base_amount": 34000,  "tax_amount": 6120,    "total_amount": 40120,    "deposit_paid": 12000},
        {"expo_event": "KTE2026",       "exhibitor": "rahul@techspark.in",        "stall": "KTE2026-A-104",        "payment_status": "Pending", "base_amount": 10800,  "tax_amount": 1944,    "total_amount": 12744,    "deposit_paid": 5000},
        # ── New ────────────────────────────────────────────────
        {"expo_event": "HMCE2026",      "exhibitor": "anil@mediscan.in",          "stall": "HMCE2026-M1-202",      "payment_status": "Paid",    "base_amount": 43200,  "tax_amount": 7776,    "total_amount": 50976,    "deposit_paid": 20000},
        {"expo_event": "HMCE2026",      "exhibitor": "faisal@pharmacure.in",      "stall": "HMCE2026-M2-103",      "payment_status": "Partial", "base_amount": 21600,  "tax_amount": 3888,    "total_amount": 25488,    "deposit_paid": 12000},
        {"expo_event": "AGRIINDIA2026", "exhibitor": "venkatesh@agroforce.in",    "stall": "AGRIINDIA2026-PA-301", "payment_status": "Paid",    "base_amount": 151200, "tax_amount": 27216,   "total_amount": 178416,   "deposit_paid": 80000},
        {"expo_event": "AGRIINDIA2026", "exhibitor": "lakshmi@greenroot.in",      "stall": "AGRIINDIA2026-PB-103", "payment_status": "Pending", "base_amount": 6300,   "tax_amount": 1134,    "total_amount": 7434,     "deposit_paid": 4000},
        {"expo_event": "EDUTECH2026",   "exhibitor": "deepa@classroomconnect.in", "stall": "EDUTECH2026-E1-104",   "payment_status": "Paid",    "base_amount": 9900,   "tax_amount": 1782,    "total_amount": 11682,    "deposit_paid": 5000},
        {"expo_event": "EDUTECH2026",   "exhibitor": "ananya@learnsphere.in",     "stall": "EDUTECH2026-E2-102",   "payment_status": "Partial", "base_amount": 9450,   "tax_amount": 1701,    "total_amount": 11151,    "deposit_paid": 5000},
    ]

    for bk in bookings:
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
        # ── KTE2026 ────────────────────────────────────────────
        {"lead_name": "Arun Pillai",          "company": "NexGen Robotics",          "expo_event": "KTE2026",      "contact_number": "+919876001234", "email": "arun@nexgenrobotics.com",       "country": "India",                "product_interest": "IoT Devices, Robotics",             "lead_source": "Manual",  "lead_rating": "Hot",  "exhibitor": "anoop@byteforge.in",        "follow_up_date": add_days(today(), 3),  "notes": "<p>Very interested in bulk IoT order. Schedule demo call this week.</p>"},
        {"lead_name": "Sandra Thomas",        "company": "Kerala Startups Hub",      "expo_event": "KTE2026",      "contact_number": "+919988001122", "email": "sandra@keralastartuphub.in",    "country": "India",                "product_interest": "SaaS Platform, Cloud Solutions",    "lead_source": "Scan",    "lead_rating": "Warm", "exhibitor": "rahul@techspark.in",        "follow_up_date": add_days(today(), 7),  "notes": "<p>Interested in annual subscription. Send pricing deck.</p>"},
        {"lead_name": "Mohammed Fazil",       "company": "Gulf Trade Connect",       "expo_event": "KTE2026",      "contact_number": "+919765009988", "email": "fazil@gulftrade.ae",            "country": "United Arab Emirates", "product_interest": "AI Analytics Tools",                "lead_source": "Meeting", "lead_rating": "Hot",  "exhibitor": "priya@dataviz.io",          "follow_up_date": add_days(today(), 2),  "notes": "<p>UAE government project. Very high potential. Priority follow-up.</p>"},
        # ── SIFS2026 ───────────────────────────────────────────
        {"lead_name": "Deepa Narayanan",      "company": "FoodTech Ventures",        "expo_event": "SIFS2026",     "contact_number": "+919900223344", "email": "deepa@foodtechventures.in",     "country": "India",                "product_interest": "Spice Blends, Organic Products",    "lead_source": "Manual",  "lead_rating": "Warm", "exhibitor": "suresh@spicegarden.com",    "follow_up_date": add_days(today(), 10), "notes": "<p>Looking to source organic spices for restaurant chain. 200+ outlets.</p>"},
        # ── BCON2026 ───────────────────────────────────────────
        {"lead_name": "Sanjay Mehta",         "company": "Prestige Constructions",   "expo_event": "BCON2026",     "contact_number": "+919811223344", "email": "sanjay@prestigeconstructions.in","country": "India",               "product_interest": "Granite, Premium Tiles",            "lead_source": "Scan",    "lead_rating": "Hot",  "exhibitor": "ramesh@stonecraft.co.in",   "follow_up_date": add_days(today(), 1),  "notes": "<p>3 upcoming luxury villa projects. Needs granite quote for 15,000 sqft.</p>"},
        {"lead_name": "Ritu Sharma",          "company": "Urban Nest Developers",    "expo_event": "BCON2026",     "contact_number": "+919845667788", "email": "ritu@urbannest.in",             "country": "India",                "product_interest": "Smart Lighting, Home Automation",   "lead_source": "Meeting", "lead_rating": "Cold", "exhibitor": "kavitha@smarthome.in",      "follow_up_date": add_days(today(), 14), "notes": "<p>Early stage inquiry. Budget not confirmed yet.</p>"},
        # ── HMCE2026 ───────────────────────────────────────────
        {"lead_name": "Dr. Smitha Varghese",  "company": "Believers Church Hospital","expo_event": "HMCE2026",     "contact_number": "+919876600001", "email": "smitha@bchospital.org",         "country": "India",                "product_interest": "MRI Equipment, Portable Diagnostics","lead_source": "Meeting", "lead_rating": "Hot",  "exhibitor": "anil@mediscan.in",          "follow_up_date": add_days(today(), 2),  "notes": "<p>Planning to set up a new diagnostics wing. Budget approved for 2 MRI units.</p>"},
        {"lead_name": "Reji Thomas",          "company": "Sunrise Poly Clinic",      "expo_event": "HMCE2026",     "contact_number": "+919876600002", "email": "reji@sunriseclinic.in",         "country": "India",                "product_interest": "Hospital Management System",        "lead_source": "Scan",    "lead_rating": "Warm", "exhibitor": "roshni@healthtech.in",      "follow_up_date": add_days(today(), 5),  "notes": "<p>Running 3 clinics. Wants unified patient record system. Demo requested.</p>"},
        {"lead_name": "Ahmed Al Rashidi",     "company": "Gulf Medical Supplies LLC","expo_event": "HMCE2026",     "contact_number": "+971501234567", "email": "ahmed@gulfmedsupply.ae",        "country": "United Arab Emirates", "product_interest": "Generic Medicines, Nutraceuticals", "lead_source": "Meeting", "lead_rating": "Hot",  "exhibitor": "faisal@pharmacure.in",      "follow_up_date": add_days(today(), 1),  "notes": "<p>Wants to import 50+ SKUs to UAE. MOH registration support needed. Very high value deal.</p>"},
        # ── AGRIINDIA2026 ──────────────────────────────────────
        {"lead_name": "Nagaraju Patel",       "company": "Patel Agri Co-op Society","expo_event": "AGRIINDIA2026","contact_number": "+919876600003", "email": "nagaraju@patelagricoop.in",     "country": "India",                "product_interest": "Mini Harvesters, Soil Tillers",     "lead_source": "Manual",  "lead_rating": "Hot",  "exhibitor": "venkatesh@agroforce.in",    "follow_up_date": add_days(today(), 3),  "notes": "<p>Society of 200 farmers. Wants group purchase of 15 mini harvesters.</p>"},
        {"lead_name": "Rajini Murugavel",     "company": "Murugavel Organic Farms",  "expo_event": "AGRIINDIA2026","contact_number": "+919876600004", "email": "rajini@morganicfarms.in",       "country": "India",                "product_interest": "Organic Seeds, Bio Fertilizers",    "lead_source": "Scan",    "lead_rating": "Warm", "exhibitor": "lakshmi@greenroot.in",      "follow_up_date": add_days(today(), 6),  "notes": "<p>200 acres organic farm transitioning. Interested in full bio-input package.</p>"},
        {"lead_name": "Sridhar Venkatesan",   "company": "Tamil Nadu Agri Dept.",    "expo_event": "AGRIINDIA2026","contact_number": "+919876600005", "email": "sridhar@tnagri.gov.in",         "country": "India",                "product_interest": "Agricultural Drones, Crop Monitoring","lead_source": "Meeting","lead_rating": "Hot",  "exhibitor": "mohan@skyfarmdrones.in",    "follow_up_date": add_days(today(), 2),  "notes": "<p>State govt pilot for drone spraying in 5 districts. Potential 50 units. Send proposal ASAP.</p>"},
        # ── EDUTECH2026 ────────────────────────────────────────
        {"lead_name": "Fr. Mathew Kuriakose", "company": "St. Joseph's Group of Schools","expo_event": "EDUTECH2026","contact_number": "+919876600006","email": "mathew@stjosephschools.in",    "country": "India",                "product_interest": "Smart Boards, Language Labs",       "lead_source": "Meeting", "lead_rating": "Hot",  "exhibitor": "deepa@classroomconnect.in", "follow_up_date": add_days(today(), 3),  "notes": "<p>12 schools need smart classroom upgrade. Budget Rs 2Cr allocated. Site visit requested.</p>"},
        {"lead_name": "Nisha Balakrishnan",   "company": "Future Scholars Academy",  "expo_event": "EDUTECH2026",  "contact_number": "+919876600007", "email": "nisha@futurescholars.in",      "country": "India",                "product_interest": "Adaptive Learning Platform, STEM Kits","lead_source": "Scan",  "lead_rating": "Warm", "exhibitor": "ananya@learnsphere.in",     "follow_up_date": add_days(today(), 7),  "notes": "<p>Coaching centre with 1500 students. Interested in annual platform license.</p>"},
        {"lead_name": "Imran Hussain",        "company": "Gulf Knowledge Institute", "expo_event": "EDUTECH2026",  "contact_number": "+97450112233",  "email": "imran@gulfknowledge.qa",       "country": "Qatar",                "product_interest": "Coding Bootcamps, Skill Certification","lead_source": "Meeting","lead_rating": "Hot",  "exhibitor": "karthik@skillbridge.in",    "follow_up_date": add_days(today(), 4),  "notes": "<p>Wants to white-label SkillBridge curriculum for Qatar. 500 students. International partnership.</p>"},
    ]

    for lead in leads:
        doc = frappe.get_doc({
            "doctype":          "CRM Lead",
            "lead_name":        lead["lead_name"],
            "company":          lead["company"],
            "expo_event":       lead["expo_event"],
            "contact_number":   lead["contact_number"],
            "email":            lead["email"],
            "country":          lead.get("country"),
            "product_interest": lead["product_interest"],
            "lead_source":      lead["lead_source"],
            "lead_rating":      lead["lead_rating"],
            "exhibitor":        lead["exhibitor"],
            "follow_up_date":   lead["follow_up_date"],
            "notes":            lead["notes"],
        })
        doc.insert(ignore_permissions=True)
    print(f"    Created {len(leads)} CRM Leads")


# ─────────────────────────────────────────────────────────────
# CLEAN FUNCTIONS
# ─────────────────────────────────────────────────────────────

def clean_seed():
    """Wipes ALL seed data across all events."""
    frappe.set_user("Administrator")
    for dt in ["CRM Lead", "Stall Booking", "Exhibitor Profile", "Expo Service", "Expo Stall", "Expo Hall", "Expo Event"]:
        frappe.db.sql(f"DELETE FROM `tab{dt}`")
    frappe.db.commit()
    print(" Cleaned all seed data!")


def clean_extra_seed():
    """Wipes only the 3 new events (HMCE2026, AGRIINDIA2026, EDUTECH2026)."""
    frappe.set_user("Administrator")
    new_events = ["HMCE2026", "AGRIINDIA2026", "EDUTECH2026"]

    for dt in ["CRM Lead", "Stall Booking"]:
        for ev in new_events:
            for name in frappe.get_all(dt, filters={"expo_event": ev}, pluck="name"):
                frappe.delete_doc(dt, name, ignore_permissions=True, force=True)

    for ev in new_events:
        for name in frappe.get_all("Exhibitor Profile", filters={"expo_event": ev}, pluck="name"):
            frappe.delete_doc("Exhibitor Profile", name, ignore_permissions=True, force=True)

    for dt in ["Expo Service", "Expo Stall", "Expo Hall"]:
        for ev in new_events:
            for name in frappe.get_all(dt, filters={"expo_event": ev}, pluck="name"):
                frappe.delete_doc(dt, name, ignore_permissions=True, force=True)

    for ev in new_events:
        if frappe.db.exists("Expo Event", ev):
            frappe.delete_doc("Expo Event", ev, ignore_permissions=True, force=True)

    frappe.db.commit()
    print(" Cleaned extra seed data (HMCE2026, AGRIINDIA2026, EDUTECH2026)!")