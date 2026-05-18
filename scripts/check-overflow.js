const path = require("path");
const { chromium } = require("playwright");

const viewports = [
  { width: 1440, height: 1000 },
  { width: 1280, height: 1000 },
  { width: 1024, height: 1000 },
];

async function main() {
  const browser = await chromium.launch({
    channel: "chrome",
    headless: true,
  });

  const failures = [];
  const fileUrl = "file://" + path.resolve(__dirname, "..", "index.html");

  for (const viewport of viewports) {
    const page = await browser.newPage({ viewport });
    await page.goto(fileUrl);
    await page.locator("#club-os").scrollIntoViewIfNeeded();
    await page.waitForTimeout(250);

    const result = await page.evaluate(() => {
      const documentElement = document.documentElement;
      const body = document.body;
      const clubOs = document.querySelector("#club-os");
      const cards = Array.from(document.querySelectorAll("#club-os .system-card"));
      const viewportWidth = window.innerWidth;

      const pageOverflow =
        documentElement.scrollWidth > viewportWidth || body.scrollWidth > viewportWidth;

      const overflowingCards = cards
        .map((card, index) => {
          const rect = card.getBoundingClientRect();
          return {
            index: index + 1,
            left: Math.round(rect.left),
            right: Math.round(rect.right),
            overflowLeft: rect.left < -1,
            overflowRight: rect.right > viewportWidth + 1,
          };
        })
        .filter((card) => card.overflowLeft || card.overflowRight);

      return {
        viewportWidth,
        documentScrollWidth: documentElement.scrollWidth,
        bodyScrollWidth: body.scrollWidth,
        clubOsWidth: clubOs ? Math.round(clubOs.getBoundingClientRect().width) : 0,
        pageOverflow,
        overflowingCards,
      };
    });

    if (result.pageOverflow || result.overflowingCards.length > 0) {
      failures.push(result);
    }

    console.log(
      `${viewport.width}px: page scrollWidth=${result.documentScrollWidth}, ` +
        `body scrollWidth=${result.bodyScrollWidth}, ` +
        `Club OS cards overflowing=${result.overflowingCards.length}`
    );

    await page.close();
  }

  await browser.close();

  if (failures.length > 0) {
    console.error("\nHorizontal overflow detected:");
    console.error(JSON.stringify(failures, null, 2));
    process.exit(1);
  }

  console.log("\nNo horizontal overflow detected at 1440px, 1280px, or 1024px.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
