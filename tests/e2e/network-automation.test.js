const puppeteer = require("puppeteer");

describe("Network Automation End-to-End Tests", () => {
  let browser;
  let page;

  beforeAll(async () => {
    browser = await puppeteer.launch({
      headless: false,
      slowMo: 50,
    });
    page = await browser.newPage();
    await page.goto("http://localhost:5173");
  });

  afterAll(async () => {
    await browser.close();
  });

  describe("GenAI Automation Workflow", () => {
    test("should navigate to GenAI Automation page", async () => {
      await page.click('a[href="/genai"]');
      await page.waitForSelector("h1");
      const title = await page.$eval("h1", (el) => el.textContent);
      expect(title).toBe("GenAI Network Automation");
    });

    test("should generate commands from network intent", async () => {
      // Enter network intent
      await page.type(
        "textarea#intent",
        "configure interface fastethernet0/0 with description TEST-INTERFACE",
      );

      // Select target device
      await page.click('[data-testid="device-select"]');
      await page.click("text=Dummy-RT1 (10.255.255.3)");

      // Generate commands
      await page.click('button:has-text("Generate Commands")');

      // Wait for commands to be generated
      await page.waitForSelector("pre", { timeout: 5000 });

      const commands = await page.$eval("pre", (el) => el.textContent);
      expect(commands).toContain("interface fastethernet0/0");
      expect(commands).toContain("description");
    });

    test("should validate generated commands", async () => {
      // Click validate button
      await page.click('button:has-text("Validate")');

      // Wait for validation steps to complete
      await page.waitForSelector('[data-testid="validation-complete"]', {
        timeout: 10000,
      });

      // Check validation status
      const validationBadge = await page.$eval(
        ".bg-green-50",
        (el) => el.textContent,
      );
      expect(validationBadge).toContain("Validation Passed");
    });

    test("should deploy configuration to dummy device", async () => {
      // Click deploy button
      await page.click('button:has-text("Deploy Configuration")');

      // Wait for deployment to complete
      await page.waitForSelector('[data-testid="deployment-complete"]', {
        timeout: 8000,
      });

      // Check deployment status
      const deploymentAlert = await page.$eval(
        ".bg-green-50 .text-green-700",
        (el) => el.textContent,
      );
      expect(deploymentAlert).toContain("Configuration deployed successfully");
    });
  });

  describe("Network Operations - Cisco 3725 Devices", () => {
    test("should navigate to Network Operations", async () => {
      await page.click('a[href="/network"]');
      await page.waitForSelector("h1");
      const title = await page.$eval("h1", (el) => el.textContent);
      expect(title).toBe("Network Operations");
    });

    test("should display Cisco 3725 devices", async () => {
      const deviceRows = await page.$$eval("tbody tr", (rows) =>
        rows.map((row) => {
          const cells = row.querySelectorAll("td");
          return {
            name: cells[0]?.textContent,
            ip: cells[1]?.textContent,
            type: cells[3]?.textContent,
          };
        }),
      );

      expect(deviceRows.some((device) => device.name === "Dummy-RT1")).toBe(
        true,
      );
      expect(deviceRows.some((device) => device.name === "Real-RT1")).toBe(
        true,
      );
      expect(
        deviceRows.some((device) => device.type === "cisco_3725_telnet"),
      ).toBe(true);
    });

    test("should run commands on dummy Cisco 3725 router", async () => {
      // Select Run Commands tab
      await page.click('button[data-value="commands"]');

      // Select device
      await page.click('[data-testid="device-select-commands"]');
      await page.click("text=Dummy-RT1");

      // Enter commands
      await page.type("textarea#commands", "show ip interface brief");

      // Run commands
      await page.click('button:has-text("Run Commands")');

      // Wait for output
      await page.waitForSelector("pre", { timeout: 5000 });

      const output = await page.$eval("pre", (el) => el.textContent);
      expect(output).toContain("Cisco 3725");
      expect(output).toContain("FastEthernet0/0");
      expect(output).toContain("DUMMY DEVICE SIMULATION");
    });

    test("should retrieve configuration from Cisco 3725 router", async () => {
      // Select Retrieve Configuration tab
      await page.click('button[data-value="retrieve"]');

      // Select device
      await page.click('[data-testid="device-select-retrieve"]');
      await page.click("text=Dummy-RT1");

      // Retrieve configuration
      await page.click('button:has-text("Retrieve Configuration")');

      // Wait for retrieval steps to complete
      await page.waitForSelector('[data-testid="config-retrieved"]', {
        timeout: 15000,
      });

      const config = await page.$eval("pre", (el) => el.textContent);
      expect(config).toContain("version 12.4");
      expect(config).toContain("interface FastEthernet0/0");
      expect(config).toContain("DUMMY DEVICE SIMULATION");
    });

    test("should push configuration to Cisco 3725 router", async () => {
      // Select Push Configuration tab
      await page.click('button[data-value="config"]');

      // Select device
      await page.click('[data-testid="device-select-config"]');
      await page.click("text=Dummy-RT1");

      // Enter configuration
      await page.type(
        "textarea#config",
        "interface fastethernet0/0\ndescription TEST-CONFIG\nno shutdown",
      );

      // Push configuration
      await page.click('button:has-text("Push Configuration")');

      // Wait for output
      await page.waitForSelector("pre", { timeout: 5000 });

      const output = await page.$eval("pre", (el) => el.textContent);
      expect(output).toContain("Cisco 3725 Configuration Applied Successfully");
      expect(output).toContain("DUMMY DEVICE SIMULATION");
    });
  });

  describe("Real Device Testing", () => {
    test("should handle real device operations", async () => {
      // Test with real device
      await page.click('[data-testid="device-select-commands"]');
      await page.click("text=Real-RT1");

      await page.fill("textarea#commands", "show version");
      await page.click('button:has-text("Run Commands")');

      await page.waitForSelector("pre", { timeout: 5000 });

      const output = await page.$eval("pre", (el) => el.textContent);
      expect(output).toContain("REAL DEVICE");
      expect(output).toContain("Cisco 3725");
    });
  });

  describe("Error Handling", () => {
    test("should handle deployment errors gracefully", async () => {
      await page.goto("http://localhost:5173/genai");

      // Generate commands
      await page.type("textarea#intent", "test error scenario");
      await page.click('button:has-text("Generate Commands")');
      await page.waitForSelector("pre");

      // Validate
      await page.click('button:has-text("Validate")');
      await page.waitForSelector(".bg-green-50");

      // Deploy (may fail randomly for testing)
      await page.click('button:has-text("Deploy Configuration")');

      // Wait for either success or error
      await page.waitForSelector(".bg-red-50, .bg-green-50", { timeout: 8000 });

      // Check if error is handled properly
      const errorElements = await page.$$(".bg-red-50");
      if (errorElements.length > 0) {
        const errorText = await page.$eval(
          ".bg-red-50 .text-red-700",
          (el) => el.textContent,
        );
        expect(errorText).toContain("Error: An unexpected error occurred");
      }
    });
  });
});
