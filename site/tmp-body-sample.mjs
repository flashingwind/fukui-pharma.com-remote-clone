import { chromium } from 'playwright';
import { execSync } from 'child_process';
const slugs=['atopic','tyuumon','mokuzitu','mauibus','b1ganyuu'];
const browser=await chromium.launch({headless:true});
const page=await (await browser.newContext({viewport:{width:1400,height:2000}})).newPage();
for (const slug of slugs){
  await page.goto(`file:///Users/flashingwind/Documents/fukui-pharma.com-remote-clone/${slug}.htm`,{waitUntil:'networkidle'});
  await page.locator('body').screenshot({path:`/tmp/fukui_compare_body/${slug}.base.body.png`});
  await page.goto(`http://localhost:5173/${slug}`,{waitUntil:'networkidle'});
  await page.locator('#center').screenshot({path:`/tmp/fukui_compare_body/${slug}.local.center.png`});
  const rmse=execSync(`magick compare -metric RMSE /tmp/fukui_compare_body/${slug}.base.body.png /tmp/fukui_compare_body/${slug}.local.center.png null: 2>&1 | tail -n1`).toString().trim();
  console.log(slug,rmse);
}
await browser.close();
