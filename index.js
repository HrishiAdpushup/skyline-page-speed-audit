const fs = require("fs");
const lighthouse = require("lighthouse");
const puppeteer = require("puppeteer");
const { URL } = require("url");

(function () {
  const url = "https://www.skylinewebcams.com/";
  (async () => {
    for (var i = 1; i <= 30; i++) {
      console.log(`*********************Test ${i}*********************`);

      // Use Puppeteer to launch headful Chrome and don't use its default 800x600 viewport.
      const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: null,
      });

      // Wait for Lighthouse to open url, then inject our code.
      browser.on("targetchanged", async (target) => {
        const page = await target.page();

        if (!page) return;

        if (page.url() === url) {
          await page.waitForSelector(".home");

          await page.addScriptTag({
            content: `
            (function(w, d) {

                var s = d.createElement('script');
                s.src = '//cdn.adpushup.com/42973/adpushup.js';
                s.crossOrigin='anonymous';
                s.type = 'text/javascript';
                s.async = true;
                (d.getElementsByTagName('head')[0] || d.getElementsByTagName('body')[0]).appendChild(s);
                w.adpushup = w.adpushup || {que:[]};

                var adSpotParentOne = d.getElementsByClassName('my5')[0]
                while(adSpotParentOne?.firstChild){
                    adSpotParentOne.removeChild(adSpotParentOne.firstChild)
                }

                var adDiv = '<div id="4a179855-5cb8-49a4-ae0c-c962d044b89c" class="_ap_apex_ad"></div>'
                adSpotParentOne.insertAdjacentHTML( 'afterbegin', adDiv );

                var adScript = d.createElement('script');
                adScript.type = 'text/javascript';
                adScript.innerHTML = "var adpushup = window.adpushup = window.adpushup || {};adpushup.que=adpushup.que || [];console.log('Hello World');  adpushup.que.push(function() {adpushup.triggerAd('4a179855-5cb8-49a4-ae0c-c962d044b89c');});";
                d.getElementById('4a179855-5cb8-49a4-ae0c-c962d044b89c').appendChild(adScript);

                var adSpotParentTwo = d.getElementsByClassName('my5')[1]

                while(adSpotParentTwo?.firstChild){
                    adSpotParentTwo.removeChild(adSpotParentTwo.firstChild)
                }
                var adDivTwo = '<div id="ca5fe7bd-278a-46b0-b9bd-e5de1a5e3132" class="_ap_apex_ad"></div>'
                adSpotParentTwo.insertAdjacentHTML( 'afterbegin', adDivTwo );
                var adScriptTwo = d.createElement('script');
                adScriptTwo.type = 'text/javascript';
                adScriptTwo.innerHTML = "var adpushup = window.adpushup = window.adpushup || {};adpushup.que  =  adpushup.que || [];console.log('Hello World');  adpushup.que.push(function(){adpushup.triggerAd ('ca5fe7bd-278a-46b0-b9bd-e5de1a5e3132');});";
                d.getElementById('ca5fe7bd-278a-46b0-b9bd-e5de1a5e3132').appendChild(adScriptTwo);

              
                })(window, document);`,
          });
        }
      });

      const options = {
        logLevel: "info",
        output: "html",
        disableDeviceEmulation: true,
        onlyCategories: ["performance"],
        port: new URL(browser.wsEndpoint()).port,
        stratergy: "desktop",
        blockedUrlPatterns: [
          "*googlesyndication.com*",
          "*googleadservices.com*",
        ],
      };

      const lhConfig = {
        extends: "lighthouse:default",
        settings: {
          formFactor: "desktop",
          throttling: {
            rttMs: 40,
            throughputKbps: 10240,
            cpuSlowdownMultiplier: 1,
            requestLatencyMs: 0,
            downloadThroughputKbps: 0,
            uploadThroughputKbps: 0,
          },
          screenEmulation: {
            mobile: false,
            width: 1350,
            height: 940,
            deviceScaleFactor: 1,
            disabled: false,
          },
          onlyCategories: ["performance"],
          onlyAudits: [
            "first-meaningful-paint",
            "speed-index",
            "first-cpu-idle",
            "interactive",
            "cumulative-layout-shift",
          ],
        },
        emulatedFormFactor: "desktop",
      };

      const runnerResult = await lighthouse(url, options, lhConfig);

      const reportHtml = runnerResult.report;
      fs.writeFileSync(i + "_DESKTOP.html", reportHtml);
      console.log("Report is done for", runnerResult.lhr.finalUrl);
      console.log(
        "Performance score was",
        runnerResult.lhr.categories.performance.score * 100
      );

      await browser.close();
    }
  })();
})();
