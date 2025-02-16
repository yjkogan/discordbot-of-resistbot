import express from "express";
const router = express.Router();

router
  .post("/receive", function (req: express.Request, res: express.Response) {
    const from = req.query.from?.toString();
    const text = req.query.text?.toString();
    const fakeResponse = { contents: "received" };
    res.send(fakeResponse);
    res.on("finish", () => {
      if (!from || !text) {
        return;
      }
      rpResponse({ to: from, text });
    });
  })
  .get("/receive", function (req: express.Request, res: express.Response) {
    res.send("Got it");
  });

function rpResponse({ to, text }: { to: string; text: string }) {
  fetch("http://127.0.0.1:5555/rp-response", {
    method: "POST",
    body: JSON.stringify({
      id: "10",
      to,
      channel: "whatever",
      ...textToJSONPartial(text),
    }),
    headers: {
      "Content-Type": "application/json",
    },
  });
}

function textToJSONPartial(text: string): {
  text: string;
  attachments: string[];
  quick_replies: string[];
} {
  if (text.startsWith("Sign")) {
    return {
      text: '✊ Do you want to send "Stop Elon Musk from stealing our personal information!" to Sen. Padilla, Sen. Schiff and Rep. Simon?\n\n(Reply YES to send or READ to read it first.)',
      attachments: [],
      quick_replies: ["Yes", "Read", "No"],
    };
  } else if (text === "Read") {
    return {
      text: `I am writing to urge you to stop Elon Musk from stealing our personal information.

      It appears Musk has hacked into millions of Americans’ personal information and now has access to their taxes, Social Security, student debt and financial aid filings. Musk's so-called Department of Government Efficiency was not created by Congress—it is operating with zero transparency and in clear violation of federal law.
      
      This violation of our privacy is causing American families across the country to fear for our privacy, safety and dignity. If this goes unchecked, Musk could steal our private data to help in making cuts to vital government programs that our families depend on—and to make it easier to cut taxes for himself and other billionaires. 
      
      We must have guardrails to stop this unlawful invasion of privacy.
      
      Congress and the Trump administration must stop Elon Musk from stealing Americans' tax and other private data.
      
      *  *  *
      
      📢 Do you want to send this to your representatives?
      `,
      attachments: [],
      quick_replies: ["Yes", "No"],
    };
  } else if (text === "Yes") {
    return {
      text: `✍️ Signed! You're number 7,350!
      

      How would you like to send your letters? (You have 4,000 coins.)
      
      📠 Fax (10 coins)
      📧 Email (free)
      `,
      attachments: [],
      quick_replies: ["Fax", "Email"],
    };
  } else if (text === "Email") {
    return {
      text: `📧 Your letter to Rep. Simon was sent via email!

      📨 123,000 have gone out to all officials in the past 24 hours!
      🔗 Share this link to drive more signers:`,
      attachments: ["https://resist.bot/petitions/PUTWGR"],
      quick_replies: [],
    };
  } else {
    return {
      text: "I didnt understand that",
      attachments: [],
      quick_replies: [],
    };
  }
}

export default router;
