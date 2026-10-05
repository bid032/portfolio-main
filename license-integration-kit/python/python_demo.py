"""
Bid032 License SDK - Python Application Demo
Run this script to test license key activation and protection in Python tools.
"""

from license_client import LicenseClient

PRODUCT_ID = "my-python-app"  # Match product ID/slug from store
STORE_URL = "https://bid032.com"  # Or http://localhost:3000 for local testing

def main():
    print("=" * 60)
    print(" 🚀 Welcome to My Licensed Python Application")
    print("=" * 60)

    client = LicenseClient(product_id=PRODUCT_ID, store_url=STORE_URL, device_name="Python Workstation")

    # 1. Check existing session
    print("\n🔍 Checking local license status...")
    status = client.validate()

    if status.get("valid"):
        print(f" ✅ License ACTIVE!")
        print(f" 📌 Plan: {status.get('plan_name', 'Standard')}")
        print(f" ⏳ Expires: {status.get('expires_at', 'Lifetime')}")
        run_main_application()
        return

    print("\n ❌ No valid license found.")
    print(" Please choose an option:")
    print("  [1] Enter License Key")
    print("  [2] Request 3-Day Free Trial")
    print("  [3] Exit")

    choice = input("\nSelect (1-3): ").strip()

    if choice == "1":
        key = input("Enter License Key (XXXX-XXXX-XXXX-XXXX): ").strip()
        print("\n⏳ Activating key...")
        res = client.activate(key)

        if res.get("valid"):
            print(" ✅ Activation Successful!")
            print(f" 📌 Plan: {res.get('plan_name')}")
            run_main_application()
        else:
            print(f" ❌ Activation Failed: {res.get('error')}")

    elif choice == "2":
        email = input("Enter your email for free trial: ").strip()
        print("\n⏳ Requesting trial...")
        res = client.request_trial(email)

        if res.get("success"):
            key = res.get("rawLicenseKey")
            print(f" ✅ Trial Key Issued: {key}")
            print("⏳ Activating trial on this machine...")
            act_res = client.activate(key)
            if act_res.get("valid"):
                print(" ✅ Trial Activated!")
                run_main_application()
            else:
                print(f" ❌ Trial activation error: {act_res.get('error')}")
        else:
            print(f" ❌ Trial Request Failed: {res.get('error')}")
    else:
        print(" Exiting application.")

def run_main_application():
    print("\n" + "=" * 60)
    print(" ⚡ UNLOCKED: Running Core Application Logic Here...")
    print("=" * 60)

if __name__ == "__main__":
    main()
