

(function() {
  var DomParser = require('dom-parser');
  var randomWords = require('random-words');
  var pickRandom = require('pick-random');
  var FastAverageColor = require('fast-average-color');
  const GoogleImages = require('google-images');
  const { createCanvas, loadImage } = require('canvas')
  const ncc = require('ncc')

  const fs = require('fs');
  const client = new GoogleImages(process.env.GOOGLE_CSE_ID, process.env.GOOGLE_API_KEY);

  var axios = require('axios');

  const lerp = (a,b,x) => (a + (b-a)*x)
  const EMOJI = [
    '😄','😃','😀','😊','☺','😉','😍','😘','😚','😗','😙','😜','😝','😛','😳','😁','😔','😌','😒','😞','😣','😢','😂','😭','😪','😥','😰','😅','😓','😩','😫','😨','😱','😠','😡','😤','😖','😆','😋','😷','😎','😴','😵','😲','😟','😦','😧','😈','👿','😮','😬','😐','😕','😯','😶','😇','😏','😑','👲','👳','👮','👷','💂','👶','👦','👧','👨','👩','👴','👵','👱','👼','👸','😺','😸','😻','😽','😼','🙀','😿','😹','😾','👹','👺','🙈','🙉','🙊','💀','👽','💩','🔥','✨','🌟','💫','💥','💢','💦','💧','💤','💨','👂','👀','👃','👅','👄','👍','👎','👌','👊','✊','✌','👋','✋','👐','👆','👇','👉','👈','🙌','🙏','☝','👏','💪','🚶','🏃','💃','👫','👪','👬','👭','💏','💑','👯','🙆','🙅','💁','🙋','💆','💇','💅','👰','🙎','🙍','🙇','🎩','👑','👒','👟','👞','👡','👠','👢','👕','👔','👚','👗','🎽','👖','👘','👙','💼','👜','👝','👛','👓','🎀','🌂','💄','💛','💙','💜','💚','❤','💔','💗','💓','💕','💖','💞','💘','💌','💋','💍','💎','👤','👥','💬','👣','💭','🐶','🐺','🐱','🐭','🐹','🐰','🐸','🐯','🐨','🐻','🐷','🐽','🐮','🐗','🐵','🐒','🐴','🐑','🐘','🐼','🐧','🐦','🐤','🐥','🐣','🐔','🐍','🐢','🐛','🐝','🐜','🐞','🐌','🐙','🐚','🐠','🐟','🐬','🐳','🐋','🐄','🐏','🐀','🐃','🐅','🐇','🐉','🐎','🐐','🐓','🐕','🐖','🐁','🐂','🐲','🐡','🐊','🐫','🐪','🐆','🐈','🐩','🐾','💐','🌸','🌷','🍀','🌹','🌻','🌺','🍁','🍃','🍂','🌿','🌾','🍄','🌵','🌴','🌲','🌳','🌰','🌱','🌼','🌐','🌞','🌝','🌚','🌑','🌒','🌓','🌔','🌕','🌖','🌗','🌘','🌜','🌛','🌙','🌍','🌎','🌏','🌋','🌌','🌠','⭐','☀','⛅','☁','⚡','☔','❄','⛄','🌀','🌁','🌈','🌊','🎍','💝','🎎','🎒','🎓','🎏','🎆','🎇','🎐','🎑','🎃','👻','🎅','🎄','🎁','🎋','🎉','🎊','🎈','🎌','🔮','🎥'
  ]
  const randomEmoji = () => {
    return EMOJI[Math.floor(Math.random() * EMOJI.length)];
  };
  
  const imageSearch = async (query, nMax = 1000) => {
    let images = []
    for (var p of Array(10).keys()) {
      images = images.concat(await client.search(query, {page:p}).catch(console.log));
    }

    return await Promise.all(
      images.map(async (image,i) => {
        return await loadImage(image.url).catch(console.log); // remove .thumbnail?
      })
    )
  }

  const cv = ncc(); //createCanvas(400, 400)
  const ctx = cv.getContext('2d');

  const render = async (images, settings, fn="out") => {
    // settings = {opacity: xx, blendMode: xx}
    ctx.save();
    ctx.clearRect(0, 0, cv.width, cv.height);

    ctx.globalCompositeOperation = settings.blendMode;
    ctx.globalAlpha = settings.opacity;
    images.map ((image) => {
      if (image) {
        ctx.drawImage(image, 0, 0, cv.width, cv.height)
      };
    });

    ctx.restore();

    const buf = cv.toBuffer();
    fs.writeFileSync(`${fn}.png`, buf);
  }
  
  const randomQuery = () => {
    let r = Math.random();
    if (r < 0.6) {
      return randomWords();
    } else if (r < 0.8) {
      return randomEmoji();
    } else {
      return Math.random().toString(36).substring(2,5);
    }
  }

  const generateRandom = async () => {
    let query = randomQuery();
    let opacity = lerp(0, 1, Math.random());
    let blendMode = pickRandom(['overlay', 'hard-light', 'soft-light', 'difference'])[0]

    query = "love"
    let images = await imageSearch(query);
    console.log(images.length);
    return await render(images, {opacity:0.75, blendMode: 'soft-light'}, query);
  }

  module.exports.generate = generateRandom
}());