const { chromium } = require("playwright");
const ejs = require("ejs");
const path = require("path");
const fs = require("fs").promises;
const { uploadPDFToCloudinary } = require("../utils/uploadConfig");
const Order = require("../models/order");
const User = require("../models/user");

class InvoiceService {
  /**
   * Prepare structured data for invoice template
   */
  static prepareInvoiceData(order, user) {
    // Calculate totals per item for display
    const itemsWithTotals = order.items.map((item, index) => {
      // Ensure we have a valid item structure
      const processedItem = {
        ...(item.toObject ? item.toObject() : item),
        itemTotal: (item.price || 0) * (item.quantity || 0),
        primaryImage:
          item.product?.images?.find((img) => img.is_primary) ||
          item.product?.images?.[0] ||
          null,
        // Handle variant information for display
        displayName: item.variant?.name
          ? `${item.product?.name || "Product"} - ${item.variant.name}`
          : item.product?.name || "Product",
        // Use variant metals if available, otherwise fall back to product metals
        displayMetals:
          item.variant?.metal && item.variant.metal.length > 0
            ? item.variant.metal
            : item.product?.metals || [],
        // Display price - use variant price if available
        displayPrice:
          item.variant?.totalPrice ||
          item.product?.totalPrice ||
          item.price ||
          0,
      };

      // Ensure product exists with minimum required fields
      if (!processedItem.product) {
        processedItem.product = {
          name: "Product Name Not Available",
          description: "Product description not available",
          metals: [],
          gemstones: [],
          images: [],
        };
      }

      return processedItem;
    });

    return {
      // Company information
      company: {
        name: "LuxeJewels",
        address: "123 Jewelry Street, Diamond District",
        city: "Kochi",
        state: "Kerala",
        postalCode: "682001",
        country: "India",
        phone: "+91 98765 43210",
        email: "luxejewels@gmail.com",
        website: "luxejewels.vercel.app/",
        // logoUrl: 'https://res.cloudinary.com/do5skdpv9/image/upload/v1760547730/Logo1_kdpkss.png'
        logoUrl:
          "https://res.cloudinary.com/do5skdpv9/image/upload/v1760548168/Logo3_dgzubk.png",
      },
      // Invoice details
      invoice: {
        number: `INV-${order.orderId.replace("ORD-", "")}`,
        date: new Date().toISOString().split("T")[0],
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0], // 30 days from now
      },
      // Order information
      order: {
        ...order.toObject(),
        items: itemsWithTotals,
        formattedDate: new Date(order.createdAt).toLocaleDateString("en-IN", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
      },
      // Customer information
      customer: {
        name: user.name,
        email: user.email,
        address: order.shippingAddress,
      },
      // Formatting helpers
      formatCurrency: (amount) => `₹${amount.toLocaleString("en-IN")}`,
      formatDate: (date) => new Date(date).toLocaleDateString("en-IN"),
      // Current date for generation
      generatedDate: new Date().toLocaleDateString("en-IN", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
  }
  /**
   * Generate PDF buffer using puppeteer and EJS template
   */
  static async generatePDFBuffer(invoiceData) {
    let browser = null;
    try {
      // Read and render EJS template
      const templatePath = path.join(__dirname, "../templates/invoice3.ejs");
      console.log("📄 Template path:", templatePath);

      const template = await fs.readFile(templatePath, "utf8");
      console.log("✅ Template loaded, length:", template.length);

      const html = ejs.render(template, invoiceData);
      console.log("✅ HTML rendered successfully, length:", html.length);

      // Launch Playwright browser with optimized options
      console.log("🚀 Launching Playwright browser...");
      browser = await chromium.launch({
        headless: true,
        args: [
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--disable-dev-shm-usage",
          "--single-process",
          "--disable-gpu",
          "--no-zygote",
        ],
      });
      console.log("✅ Browser launched");

      const context = await browser.newContext({
        viewport: { width: 1200, height: 800 },
      });

      const page = await context.newPage();
      console.log("📄 Page created");

      // Set content and generate PDF
      await page.setContent(html, {
        waitUntil: "networkidle",
        timeout: 30000,
      });
      console.log("✅ HTML content set");

      // Wait a bit for any async operations
      await page.waitForTimeout(1000);

      // Generate PDF with specific options for jewelry invoice
      console.log("📄 Generating PDF...");
      const pdfBuffer = await page.pdf({
        format: "A4",
        printBackground: true,
        margin: {
          top: "10mm",
          right: "8mm",
          bottom: "12mm",
          left: "8mm",
        },
        displayHeaderFooter: true,
        headerTemplate: "<div></div>", // Empty header
        footerTemplate: `
          <div style="font-size: 10px; color: #666; text-align: center; width: 100%; padding: 6px;">
            Page <span class="pageNumber"></span> of <span class="totalPages"></span> | 
            Generated on ${invoiceData.generatedDate}
          </div>
        `,
      });

      console.log(
        "✅ PDF generated successfully, size:",
        pdfBuffer.length,
        "bytes"
      );
      console.log("🔍 PDF buffer info:", {
        isBuffer: Buffer.isBuffer(pdfBuffer),
        isUint8Array: pdfBuffer instanceof Uint8Array,
        constructor: pdfBuffer.constructor.name,
        length: pdfBuffer.length,
      });

      // Playwright returns a Buffer directly, but convert if needed
      const finalBuffer = Buffer.isBuffer(pdfBuffer)
        ? pdfBuffer
        : Buffer.from(pdfBuffer);

      // Verify the buffer is valid
      if (finalBuffer.length === 0) {
        throw new Error("Generated PDF buffer is empty");
      }

      // Check if it looks like valid PDF data
      const pdfSignature = finalBuffer.slice(0, 4).toString();
      if (pdfSignature !== "%PDF") {
        console.log("⚠️ PDF signature check:", {
          signature: pdfSignature,
          firstBytes: finalBuffer.slice(0, 10).toString("hex"),
        });
        throw new Error("Generated buffer does not appear to be a valid PDF");
      }

      console.log("✅ PDF buffer validation passed");
      return finalBuffer;
    } catch (error) {
      console.error("❌ PDF generation error:", error);
      console.error("❌ Error stack:", error.stack);
      throw new Error(`PDF generation failed: ${error.message}`);
    } finally {
      if (browser) {
        try {
          await browser.close();
          console.log("🔒 Browser closed");
        } catch (closeError) {
          console.error("⚠️ Error closing browser:", closeError);
        }
      }
    }
  }

  /**
   * Generate and upload invoice PDF for an order
   * @param {string} orderId - Order ID to generate invoice for
   * @returns {Object} - Result with success status and invoice URL
   */
  static async generateInvoice(orderId) {
    try {
      // Fetch order with populated data
      const order = await Order.findOne({ orderId });
      if (!order) {
        throw new Error("Order not found");
      }

      // Check if invoice already exists (caching)
      if (order.invoiceUrl) {
        console.log("♻️ Invoice already exists, returning cached URL");
        return {
          success: true,
          message: "Invoice retrieved from cache",
          invoiceUrl: order.invoiceUrl,
        };
      }

      // Fetch user details using custom id field (not MongoDB ObjectId)
      const user = await User.findOne({ id: order.userId });
      if (!user) {
        throw new Error("User not found");
      }

      console.log("👤 User found:", { name: user.name, email: user.email });

      // Prepare invoice data
      const invoiceData = this.prepareInvoiceData(order, user);

      const pdfBuffer = await this.generatePDFBuffer(invoiceData);

      // Upload to Cloudinary
      const uploadResult = await uploadPDFToCloudinary(pdfBuffer, orderId);

      // Save invoice URL to order
      await Order.findOneAndUpdate(
        { orderId },
        { invoiceUrl: uploadResult.secure_url }
      );

      console.log("✅ Invoice generated and uploaded successfully");

      return {
        success: true,
        message: "Invoice generated successfully",
        invoiceUrl: uploadResult.secure_url,
      };
    } catch (error) {
      console.error("❌ Invoice generation error:", error);
      console.error("❌ Error stack:", error.stack);
      throw new Error(`Failed to generate invoice: ${error.message}`);
    }
  }
}

module.exports = InvoiceService;
