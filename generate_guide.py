import os
from fpdf import FPDF

class AdminGuidePDF(FPDF):
    def header(self):
        # Only add header on pages after the cover page
        if self.page_no() > 1:
            self.set_font("helvetica", "B", 8)
            self.set_text_color(140, 115, 102) # Brand Muted Text
            self.cell(0, 6, "VC CAKE ACADEMY  |  ADMIN PANEL OPERATIONS MANUAL", border="B", align="L", ln=1)
            self.ln(6)

    def footer(self):
        if self.page_no() > 1:
            self.set_y(-15)
            self.set_font("helvetica", "I", 8)
            self.set_text_color(140, 115, 102)
            self.cell(0, 10, f"Page {self.page_no()}", align="R")

    def chapter_title(self, num, title):
        self.set_font("helvetica", "B", 14)
        self.set_text_color(74, 44, 17) # Brand primary dark brown #4a2c11
        self.cell(0, 10, f"{num}. {title}", align="L", ln=1)
        self.ln(2)
        # Decorative line under title
        self.set_draw_color(197, 160, 89) # Brand Gold #c5a059
        self.set_line_width(0.5)
        y = self.get_y()
        self.line(20, y, 190, y)
        self.ln(4)

    def section_title(self, title):
        self.set_font("helvetica", "B", 11)
        self.set_text_color(184, 144, 71) # Secondary gold
        self.cell(0, 8, title, align="L", ln=1)
        self.ln(2)

    def body_text(self, text):
        self.set_font("helvetica", "", 10)
        self.set_text_color(44, 29, 17) # Brand dark text #2c1d11
        self.multi_cell(0, 5, text)
        self.ln(4)

    def bullet_point(self, title, text):
        self.set_font("helvetica", "B", 10)
        self.set_text_color(74, 44, 17)
        self.write(5, " -  " + title + ": ")
        self.set_font("helvetica", "", 10)
        self.set_text_color(44, 29, 17)
        self.write(5, text + "\n")
        self.ln(1)

def create_guide():
    pdf = AdminGuidePDF(orientation="P", unit="mm", format="A4")
    pdf.set_margins(20, 20, 20)
    pdf.set_auto_page_break(auto=True, margin=20)
    
    # ------------------ COVER PAGE ------------------
    pdf.add_page()
    
    # Background Cream Tint
    pdf.set_fill_color(253, 251, 247) # Brand cream #fdfbf7
    pdf.rect(0, 0, 210, 297, "F")
    
    # Border Frame
    pdf.set_draw_color(74, 44, 17) # primary brown
    pdf.set_line_width(1)
    pdf.rect(10, 10, 190, 277)
    pdf.set_draw_color(197, 160, 89) # gold
    pdf.set_line_width(0.5)
    pdf.rect(12, 12, 186, 273)
    
    # Cover Content
    pdf.ln(40)
    
    # Logo Placeholder Style Text
    pdf.set_font("helvetica", "B", 24)
    pdf.set_text_color(74, 44, 17)
    pdf.cell(0, 15, "VC CAKE ACADEMY", align="C", ln=1)
    pdf.ln(5)
    
    pdf.set_font("helvetica", "B", 10)
    pdf.set_text_color(184, 144, 71)
    pdf.cell(0, 10, "A C A D E M Y   &   C A K E   B O U T I Q U E", align="C", ln=1)
    pdf.ln(25)
    
    pdf.set_draw_color(197, 160, 89)
    pdf.set_line_width(1)
    pdf.line(40, pdf.get_y(), 170, pdf.get_y())
    pdf.ln(15)
    
    pdf.set_font("helvetica", "B", 18)
    pdf.set_text_color(74, 44, 17)
    pdf.multi_cell(0, 8, "ADMIN PANEL OPERATIONS MANUAL\n& USAGE GUIDE", align="C")
    pdf.ln(10)
    
    pdf.set_font("helvetica", "", 10)
    pdf.set_text_color(140, 115, 102)
    pdf.multi_cell(0, 5, "Bilingual Student Course Registrations, Custom Celebration Cake Orders,\nInteractive Content Vlogs/Blogs, Landing Page Settings,\nand Automated CBE Web Ledger Scraper Verification.", align="C")
    
    pdf.ln(60)
    pdf.set_font("helvetica", "B", 9)
    pdf.set_text_color(74, 44, 17)
    pdf.cell(0, 5, "SYSTEM ADMINISTRATOR DOCUMENTATION", align="C", ln=1)
    pdf.ln(3)
    pdf.set_font("helvetica", "", 8)
    pdf.set_text_color(140, 115, 102)
    pdf.cell(0, 5, "Version 2.0  |  July 2026", align="C", ln=1)
    
    # ------------------ PAGE 2: INTRODUCTION & LOGIN ------------------
    pdf.add_page()
    pdf.chapter_title("1", "Introduction & Panel Access")
    
    pdf.body_text(
        "Welcome to the VC Cake Academy Control Center. This dashboard is a private, administrative interface "
        "designed for administrators and management staff to run the school's operations, oversee courses, "
        "manage retail cake bookings, publish blog resources, and automate payment checks."
    )
    
    pdf.section_title("Securing & Accessing the Control Center")
    pdf.body_text(
        "To access the admin panel, perform the following steps:\n"
        "1. Open your web browser and navigate to the landing page.\n"
        "2. Click the 'Admin Link' at the bottom of the footer, or go directly to the URL: /admin/login\n"
        "3. Provide your secure username and password credentials on the login page.\n"
        "4. Click the 'Login' button. Upon successful authentication, a JSON Web Token (JWT) will be generated "
        "and securely stored in your local storage, and you will be redirected to the dashboard (/admin/dashboard)."
    )
    
    pdf.section_title("Control Center Navigation Structure")
    pdf.body_text("The panel uses a left-hand navigation sidebar layout to toggle between operations sections:")
    pdf.bullet_point("Course Registrations", "Reviewing prospective students, selecting shift timings, and checking ledger payments.")
    pdf.bullet_point("Celebration Cake Orders", "Overseeing consumer retail custom cake order forms, design inputs, and delivery logistics.")
    pdf.bullet_point("Vlogs & Blogs", "Creating and updating instructional material, vlogs (videos), and baking articles.")
    pdf.bullet_point("Hero Settings", "Bilingual text inputs modifying the main heading and cover photo of the academy's landing page.")
    pdf.bullet_point("User Inquiries", "Collecting submissions from the website contact inquiry form for manual callbacks.")
    
    # ------------------ PAGE 3: STUDENT REGISTRATION ------------------
    pdf.add_page()
    pdf.chapter_title("2", "Course Registrations Management")
    
    pdf.body_text(
        "The Course Registrations tab lists individuals who have applied to enroll in VC Cake Academy. "
        "Students are admitted into one of the three primary shifts (Morning, Afternoon, Night) for the "
        "1-month intensive course. Tuition is 2,500.00 ETB, payable via the Commercial Bank of Ethiopia (CBE)."
    )
    
    pdf.section_title("Student Information Table Column Fields")
    pdf.bullet_point("Student Name", "FullName, email contact, and telephone number details.")
    pdf.bullet_point("Shift Details", "Selected shift session ('morning', 'afternoon', or 'night').")
    pdf.bullet_point("Reference ID", "The unique transaction reference code submitted by the student for CBE payment.")
    pdf.bullet_point("Amount Paid", "Expected amount (typically 2,500.00 ETB).")
    pdf.bullet_point("Status", "Current registration state: 'PENDING', 'APPROVED', or 'REJECTED'.")
    
    pdf.ln(4)
    pdf.section_title("Registration Approval Lifecycle")
    pdf.body_text(
        "When a student submits their enrollment form, the registration is set to 'PENDING'. "
        "The administrator must verify that the student has transferred the 2,500.00 ETB fee. "
        "You can approve registrations in two ways:\n\n"
        "1. AUTOMATED VERIFICATION: Click the 'Verify via CBE Scraper' button to automatically run the "
        "payment verification crawler against the CBE Merchant Ledger (recommended).\n\n"
        "2. MANUAL APPROVAL: If the scraper fails or the student paid via another method, click the green checkmark "
        "button ('Approve Payment Manually') to mark it as approved immediately.\n\n"
        "3. REJECTION: If the transaction code is invalid, fake, or duplicate, click the red 'X' button to reject the application."
    )
    
    # ------------------ PAGE 4: CAKE ORDERS & CONTENT ------------------
    pdf.add_page()
    pdf.chapter_title("3", "Celebration Cake Orders")
    
    pdf.body_text(
        "The Celebration Cake Orders section lists custom cake requests made by consumers through the main website. "
        "Administrators must check cake specifications, flavors, weight requirements, and delivery dates to "
        "prepare orders for the bakery floor."
    )
    
    pdf.section_title("Cake Order Specifications & Workflow")
    pdf.bullet_point("Occasion & Flavor", "Cake theme type (e.g. Wedding, Birthday) and flavor profile (e.g. Chocolate, Red Velvet).")
    pdf.bullet_point("Weight & Layers", "Total weight in Kilograms (KG) and number of stacked layers requested.")
    pdf.bullet_point("Decoration Details", "A summary of decorations, text written on the cake, or custom design requests.")
    pdf.bullet_point("Delivery Date", "Target calendar date for pickup or dispatch.")
    pdf.bullet_point("Payment Details", "CBE reference number and total amount paid for the order.")
    
    pdf.ln(2)
    pdf.body_text(
        "Just like registrations, pending cake orders require verification. Use the 'Verify via CBE Scraper' "
        "button to automatically authenticate payment, or override it manually."
    )
    
    pdf.ln(4)
    pdf.chapter_title("4", "Blogs, Vlogs & Hero Settings")
    
    pdf.section_title("Vlogs & Blogs (Content Management System)")
    pdf.body_text(
        "This module manages articles and videos on the main page. The site supports bilingual content "
        "in English and Amharic. When adding content, fill out titles and descriptions in both languages. "
        "For type 'Vlog', supply a YouTube embed link (e.g. https://www.youtube.com/embed/...) which will "
        "render inside an interactive iframe. For type 'Blog', supply an image URL."
    )
    
    pdf.section_title("Hero Settings (Cover Customizer)")
    pdf.body_text(
        "The landing page cover features a full-screen poster. Administrators can edit the text "
        "and graphics dynamically. Update fields for Title, Subtitle, and CTA Button Text in both "
        "English and Amharic, and provide an Image URL for the primary showcase photo. Click 'Save' to apply "
        "the update instantly without writing code."
    )
    
    # ------------------ PAGE 5: SCRAPER DETAILS ------------------
    pdf.add_page()
    pdf.chapter_title("5", "Automated CBE Payment Scraper Crawler")
    
    pdf.body_text(
        "VC Cake Academy features an automated Commercial Bank of Ethiopia (CBE) ledger scanner "
        "to prevent human error and fraud."
    )
    
    pdf.section_title("How the Automated Crawler Works")
    pdf.body_text(
        "1. The administrator clicks 'Verify via CBE Scraper' on a pending registration or order.\n"
        "2. The system triggers a POST request to `/api/admin/verify-payment` containing the payment reference "
        "and expected amount.\n"
        "3. The background crawler logs into the CBE Merchant Account Portal at `/cbe-bank-portal` "
        "and parses the transaction ledger.\n"
        "4. It looks for a record matching the reference ID. If found, it checks if the transferred amount matches "
        "the expected tuition or cake payment.\n"
        "5. If both match, it updates the record status to 'APPROVED' in the database and returns a success notification "
        "such as: 'Payment verified! Reference code matches ledger transaction.'\n"
        "6. If the code is missing or details mismatch, it leaves the record pending and displays the error message, "
        "allowing the administrator to investigate."
    )
    
    pdf.section_title("Troubleshooting CBE Scraper Failures")
    pdf.body_text(
        "If the scraper returns 'Crawler failed to find transaction' or 'Mismatch error', verify that:\n"
        " - The student/customer typed the reference ID exactly as shown on the CBE mobile app slip.\n"
        " - The amount transferred matches the required fee.\n"
        " - The CBE Portal ledger is updated. If the transaction was done recently, wait a few minutes and try again.\n"
        " - If you confirm payment in your bank app manually, use the Manual Approval button (green check) to approve."
    )
    
    pdf.ln(10)
    pdf.set_draw_color(74, 44, 17)
    pdf.set_line_width(0.5)
    pdf.rect(20, pdf.get_y(), 170, 30)
    pdf.set_y(pdf.get_y() + 5)
    pdf.set_font("helvetica", "B", 10)
    pdf.set_text_color(74, 44, 17)
    pdf.cell(0, 5, "NEED ASSISTANCE?", align="C", ln=1)
    pdf.ln(2)
    pdf.set_font("helvetica", "", 8.5)
    pdf.set_text_color(44, 29, 17)
    pdf.cell(0, 5, "Contact the IT Support team or reference the system developers' backend documentation.", align="C", ln=1)
    pdf.cell(0, 5, "VC Cake Academy IT Department © 2026", align="C", ln=1)
    
    # Save PDF
    target_path = os.path.join("public", "VC_Cake_Admin_Panel_Usage_Guide.pdf")
    pdf.output(target_path)
    print(f"PDF Guide generated successfully at: {target_path}")

if __name__ == "__main__":
    create_guide()
