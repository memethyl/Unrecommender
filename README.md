# Unrecommender
An extension that filters YouTube recommendations based on your subscriptions and the channel you're watching.

# Installation
You can get the Unrecommender on Chrome by going here:
https://chrome.google.com/webstore/detail/unrecommender/ojejjpodljdngfmhbjfoplkckcekflae/

You can also get it on Firefox by going here:
https://addons.mozilla.org/en-US/firefox/addon/unrecommender/

# "But what if I want to install it unpacked?"
You can install it as an unpacked extension by doing the following:
1. Go to https://github.com/memethyl/Unrecommender/releases
2. Download and extract the latest ZIP
3. Go to `chrome://extensions`
4. Click "Load Unpacked..."
5. Select the Unrecommender folder you just unzipped and hit "OK"
6. Enjoy!

# Development
To help develop the Unrecommender, do the following:
1. Open your git shell and type `git clone https://github.com/memethyl/Unrecommender`
2. Download the latest jQuery version - http://jquery.com/download/ (you'll want the compressed, production version)
3. Copy that into the "js" folder of your newly cloned repository
4. Go to `chrome://extensions/`
5. Click "Load Unpacked..."
6. Select your repository folder and hit "OK"
7. Start developing!
Once you've finished doing what you wanted, [make a pull request!](https://github.com/memethyl/Unrecommender/pulls)

# "What about other browsers?"
The extension doesn't use any browser-specific APIs (yet), so it should work on browsers other than Chrome and Firefox.
I can't guarantee that, though, so if issues do arise, they (probably) aren't my fault. I'll look into it, though!

# To-do
- Use subscriber list on video recommendations as well as the homepage
- Add proper GUI
- Optional blacklisting/whitelisting in the future?
