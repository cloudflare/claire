# Claire
[![Chrome Web Store](https://img.shields.io/chrome-web-store/v/fgbpcgddpmjmamlibbaobboigaijnmkl.svg?style=flat-square)](https://chrome.google.com/webstore/detail/claire/fgbpcgddpmjmamlibbaobboigaijnmkl)

Claire is a Google Chrome extension that turns orange if the current page is on the [Cloudflare](https://www.cloudflare.com) network.
Clicking on the icon will show additional information about the page.

## Installation

### From Chrome Web Store

Install the pre-packaged version of Claire from the Chrome Web Store

[![Chrome Web Store](https://developer.chrome.com/webstore/images/ChromeWebStore_BadgeWBorder_v2_206x58.png)](https://chrome.google.com/webstore/detail/claire/fgbpcgddpmjmamlibbaobboigaijnmkl)

### From source

To use the extension from source:

* Clone this repository (`git clone https://github.com/cloudflare/claire.git`)
* In the checked out directory, run `yarn install && yarn run build`.
* Bring up the extensions page (Wrench icon -> Tools -> Extensions)
* If Developer mode is not checked, check it and this will expose a few additional buttons
* Click on the Load unpacked extension button and browse to the "dist" folder in the Claire repo folder

## Sharing & Contributing

You can use this short URL to share Claire https://is.gd/claire

Fork away and send pull requests
