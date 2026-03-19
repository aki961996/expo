"""
Expo Exhibitor Role Permissions — Patch Script
===============================================
Run once after migrate:
  bench --site ex.local execute expo_management.expo_management.patches.add_expo_exhibitor_permissions.execute
"""

import frappe


def execute():
    frappe.set_user("Administrator")

    permissions = [
        # ── Expo Event — read only (view published events) ────
        {
            "doctype": "Expo Event",
            "role": "Expo Exhibitor",
            "read": 1, "write": 0, "create": 0, "delete": 0,
            "if_owner": 0,
        },
        # ── Expo Hall — read only (view hall details) ─────────
        {
            "doctype": "Expo Hall",
            "role": "Expo Exhibitor",
            "read": 1, "write": 0, "create": 0, "delete": 0,
            "if_owner": 0,
        },
        # ── Expo Stall — read only (view stall availability) ──
        {
            "doctype": "Expo Stall",
            "role": "Expo Exhibitor",
            "read": 1, "write": 0, "create": 0, "delete": 0,
            "if_owner": 0,
        },
        # ── Expo Service — read only (view services list) ─────
        {
            "doctype": "Expo Service",
            "role": "Expo Exhibitor",
            "read": 1, "write": 0, "create": 0, "delete": 0,
            "if_owner": 0,
        },
        # ── Exhibitor Profile — own record only ───────────────
        {
            "doctype": "Exhibitor Profile",
            "role": "Expo Exhibitor",
            "read": 1, "write": 1, "create": 0, "delete": 0,
            "if_owner": 1,
        },
        # ── Stall Booking — create + own records ──────────────
        {
            "doctype": "Stall Booking",
            "role": "Expo Exhibitor",
            "read": 1, "write": 1, "create": 1, "delete": 0,
            "if_owner": 1,
        },
        # ── CRM Lead — full access to own leads ───────────────
        {
            "doctype": "CRM Lead",
            "role": "Expo Exhibitor",
            "read": 1, "write": 1, "create": 1, "delete": 1,
            "if_owner": 1,
        },
    ]

    for perm in permissions:
        doctype  = perm.pop("doctype")
        role     = perm["role"]
        if_owner = perm.get("if_owner", 0)

        # Skip if already exists
        exists = frappe.db.exists("Custom DocPerm", {
            "parent":   doctype,
            "role":     role,
            "if_owner": if_owner,
        })
        if exists:
            print(f"   ⏭  Permission already exists: {doctype} → {role} (if_owner={if_owner})")
            continue

        doc = frappe.get_doc({
            "doctype":  "Custom DocPerm",
            "parent":   doctype,
            "parenttype": "DocType",
            "parentfield": "permissions",
            "role":     role,
            "read":     perm.get("read", 0),
            "write":    perm.get("write", 0),
            "create":   perm.get("create", 0),
            "delete":   perm.get("delete", 0),
            "if_owner": if_owner,
            "permlevel": 0,
        })
        doc.insert(ignore_permissions=True)
        print(f"   ✅  Added: {doctype} → {role} (if_owner={if_owner})")

    frappe.db.commit()

    # Clear permission cache
    frappe.clear_cache()
    print("\n Expo Exhibitor permissions set successfully!")