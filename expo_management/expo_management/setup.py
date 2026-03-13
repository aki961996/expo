import frappe

def create_roles():
    roles = [
        "Expo Super Admin",
        "Expo Event Manager", 
        "Expo Finance",
        "Expo Operations",
        "Expo Exhibitor",
    ]
    for role_name in roles:
        if not frappe.db.exists("Role", role_name):
            frappe.get_doc({
                "doctype": "Role",
                "role_name": role_name,
                "desk_access": 0 if role_name == "Expo Exhibitor" else 1,
                "is_custom": 1,
            }).insert(ignore_permissions=True)
            print(f"   ✅ Created role: {role_name}")
        else:
            print(f"   ⏭️  Already exists: {role_name}")
    frappe.db.commit()
    print("✅ All roles created!")
