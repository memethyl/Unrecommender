# Unrecommender
An extension that filters YouTube recommendations based on your subscriptions and the channel you're watching.

# Installation
You can get the Unrecommender on Chrome by going here:
https://chrome.google.com/webstore/detail/unrecommender/ojejjpodljdngfmhbjfoplkckcekflae/

# "But what if I want to install it unpacked?"
You can install it as an unpacked extension by doing the following:
1. Download the latest jQuery version - http://jquery.com/download/ (you'll want the compressed, production version)
2. Download this repository (Clone or Download -> Download ZIP), then unzip it
3. Move the compressed jQuery file you just downloaded into that folder
4. Go to `chrome://extensions/`
5. Click "Load Unpacked..."
6. Select the folder you just unzipped and hit "OK"
(Only supports Google Chrome at the moment; other browsers will be supported later on!)

# Development
To help develop the Unrecommender, do the following:
1. Open your git shell and type `git clone https://github.com/memethyl/Unrecommender`
2. Download the latest jQuery version - http://jquery.com/download/ (you'll want the compressed, production version)
3. Copy that into your newly cloned repository
4. Go to `chrome://extensions/`
5. Click "Load Unpacked..."
6. Select your repository folder and hit "OK"
7. Start developing!
Once you've finished doing what you wanted, [make a pull request!](https://github.com/memethyl/Unrecommender/pulls)

# "What about other browsers?"
The extension doesn't use any Chrome-specific APIs (yet), so it should work on at least Firefox and maybe even other browsers.
I can't guarantee that, though, so if issues do arise, they (probably) aren't my fault. I'll look into it, though!

# To-do
- Iron out the kinks with Firefox
- Use subscriber list on video recommendations as well as the homepage
- Add proper GUI
- Optional blacklisting/whitelisting in the future?