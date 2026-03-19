"""
Expo Management — Role Permissions Patch
=========================================
Run:
  bench --site ex.local execute expo_management.expo_management.patches.add_expo_exhibitor_permissions.execute
"""

import frappe


def execute():
    frappe.set_user("Administrator")

    permissions = [

        # ── Administrator — full access ───────────────────────
        {"doctype": "Exhibitor Profile", "role": "Administrator", "read": 1, "write": 1, "create": 1, "delete": 1, "if_owner": 0},
        {"doctype": "Expo Event",        "role": "Administrator", "read": 1, "write": 1, "create": 1, "delete": 1, "if_owner": 0},
        {"doctype": "Expo Hall",         "role": "Administrator", "read": 1, "write": 1, "create": 1, "delete": 1, "if_owner": 0},
        {"doctype": "Expo Stall",        "role": "Administrator", "read": 1, "write": 1, "create": 1, "delete": 1, "if_owner": 0},
        {"doctype": "Expo Service",      "role": "Administrator", "read": 1, "write": 1, "create": 1, "delete": 1, "if_owner": 0},
        {"doctype": "Stall Booking",     "role": "Administrator", "read": 1, "write": 1, "create": 1, "delete": 1, "if_owner": 0},
        {"doctype": "CRM Lead",          "role": "Administrator", "read": 1, "write": 1, "create": 1, "delete": 1, "if_owner": 0},

        # ── Expo Admin — full access ──────────────────────────
        {"doctype": "Exhibitor Profile", "role": "Expo Admin", "read": 1, "write": 1, "create": 1, "delete": 1, "if_owner": 0},
        {"doctype": "Expo Event",        "role": "Expo Admin", "read": 1, "write": 1, "create": 1, "delete": 1, "if_owner": 0},
        {"doctype": "Expo Hall",         "role": "Expo Admin", "read": 1, "write": 1, "create": 1, "delete": 1, "if_owner": 0},
        {"doctype": "Expo Stall",        "role": "Expo Admin", "read": 1, "write": 1, "create": 1, "delete": 1, "if_owner": 0},
        {"doctype": "Expo Service",      "role": "Expo Admin", "read": 1, "write": 1, "create": 1, "delete": 1, "if_owner": 0},
        {"doctype": "Stall Booking",     "role": "Expo Admin", "read": 1, "write": 1, "create": 1, "delete": 1, "if_owner": 0},
        {"doctype": "CRM Lead",          "role": "Expo Admin", "read": 1, "write": 1, "create": 1, "delete": 1, "if_owner": 0},

        # ── Event Manager ─────────────────────────────────────
        {"doctype": "Exhibitor Profile", "role": "Event Manager", "read": 1, "write": 1, "create": 1, "delete": 0, "if_owner": 0},
        {"doctype": "Expo Event",        "role": "Event Manager", "read": 1, "write": 1, "create": 1, "delete": 0, "if_owner": 0},
        {"doctype": "Expo Hall",         "role": "Event Manager", "read": 1, "write": 1, "create": 1, "delete": 0, "if_owner": 0},
        {"doctype": "Expo Stall",        "role": "Event Manager", "read": 1, "write": 1, "create": 1, "delete": 0, "if_owner": 0},
        {"doctype": "Expo Service",      "role": "Event Manager", "read": 1, "write": 1, "create": 1, "delete": 0, "if_owner": 0},
        {"doctype": "Stall Booking",     "role": "Event Manager", "read": 1, "write": 1, "create": 1, "delete": 0, "if_owner": 0},
        {"doctype": "CRM Lead",          "role": "Event Manager", "read": 1, "write": 1, "create": 1, "delete": 0, "if_owner": 0},

        # ── Expo Exhibitor — own records only ─────────────────
        {"doctype": "Expo Event",        "role": "Expo Exhibitor", "read": 1, "write": 0, "create": 0, "delete": 0, "if_owner": 0},
        {"doctype": "Expo Hall",         "role": "Expo Exhibitor", "read": 1, "write": 0, "create": 0, "delete": 0, "if_owner": 0},
        {"doctype": "Expo Stall",        "role": "Expo Exhibitor", "read": 1, "write": 0, "create": 0, "delete": 0, "if_owner": 0},
        {"doctype": "Expo Service",      "role": "Expo Exhibitor", "read": 1, "write": 0, "create": 0, "delete": 0, "if_owner": 0},
        {"doctype": "Exhibitor Profile", "role": "Expo Exhibitor", "read": 1, "write": 1, "create": 0, "delete": 0, "if_owner": 1},
        {"doctype": "Stall Booking",     "role": "Expo Exhibitor", "read": 1, "write": 1, "create": 1, "delete": 0, "if_owner": 1},
        {"doctype": "CRM Lead",          "role": "Expo Exhibitor", "read": 1, "write": 1, "create": 1, "delete": 1, "if_owner": 1},
    ]

    added   = 0
    skipped = 0

    for perm in permissions:
        doctype  = perm.pop("doctype")
        role     = perm["role"]
        if_owner = perm.get("if_owner", 0)

        exists = frappe.db.exists("Custom DocPerm", {
            "parent":   doctype,
            "role":     role,
            "if_owner": if_owner,
        })

        if exists:
            print(f"   ⏭  Already exists: {doctype} → {role}")
            skipped += 1
            continue

        doc = frappe.get_doc({
            "doctype":     "Custom DocPerm",
            "parent":      doctype,
            "parenttype":  "DocType",
            "parentfield": "permissions",
            "role":        role,
            "read":        perm.get("read", 0),
            "write":       perm.get("write", 0),
            "create":      perm.get("create", 0),
            "delete":      perm.get("delete", 0),
            "if_owner":    if_owner,
            "permlevel":   0,
        })
        doc.insert(ignore_permissions=True)
        print(f"   ✅  Added: {doctype} → {role}")
        added += 1

    frappe.db.commit()
    frappe.clear_cache()
    print(f"\n Done! Added: {added}, Skipped: {skipped}")