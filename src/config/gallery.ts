/**
 * Galerie: Flyer & Flyer-Animationen aus echten Event-Reihen (Clubs, Partys, Festivals).
 * Assets liegen optimiert unter public/portfolio/{flyers,motion} (WebP 720 px, MP4-Loops 540×960, ohne Ton).
 * Eigennamen (Reihen, Events) werden nicht übersetzt; Sektionstexte: messages/{de,en}.json → portfolio.gallery.
 * Neue Arbeiten: Datei ablegen, hier eintragen – Slider, Filter und Lightbox ziehen automatisch nach.
 */

export type GallerySeries = "vibe" | "hnb" | "ayr" | "firstclass" | "jade" | "money" | "nonstop" | "allin" | "wuwh" | "blessed" | "louve" | "tika" | "kalim" | "boat" | "margiela" | "noizy" | "nobless" | "halloween" | "culture";

/** Anzeigenamen der Reihen (Filter-Chips) – in der Reihenfolge, in der sie erscheinen */
export const gallerySeries: { id: GallerySeries; name: string }[] = [
  { id: "vibe", name: "Vibe Club" },
  { id: "hnb", name: "Hot'n Brownie" },
  { id: "ayr", name: "AYR" },
  { id: "firstclass", name: "First Class" },
  { id: "jade", name: "Jade" },
  { id: "money", name: "Money Talkz" },
  { id: "nonstop", name: "Nonstop" },
  { id: "allin", name: "All In" },
  { id: "wuwh", name: "WUWH" },
  { id: "blessed", name: "Blessed" },
  { id: "louve", name: "La Louve" },
  { id: "tika", name: "Tika Island" },
  { id: "kalim", name: "Kalim" },
  { id: "noizy", name: "Noizy" },
  { id: "nobless", name: "Nobless" },
  { id: "halloween", name: "Halloween" },
  { id: "boat", name: "Boat Party" },
  { id: "margiela", name: "Margiela" },
  { id: "culture", name: "Culture" },
];

export interface GalleryFlyer {
  id: string;
  series: GallerySeries;
  title: string;
  src: string;
  width: number;
  height: number;
  blur: string;
}

export interface GalleryMotion {
  id: string;
  series: GallerySeries;
  title: string;
  video: string;
  poster: string;
  blur: string;
}

export const galleryFlyers: GalleryFlyer[] = [
  { id: "allin-flyer", series: "allin", title: "All In · Live Night", src: "/portfolio/flyers/allin-flyer.webp", width: 720, height: 1280, blur: "data:image/webp;base64,UklGRoIAAABXRUJQVlA4IHYAAADQAwCdASoMABUAPu1iqU2ppaOiMAgBMB2JQAB8jUX58Wo5Opej/UAA/uwQ45UMbr/G4rT97WMt5u/Z+x/NregGAkXnLSPZ9VAjeuCHxsNRgR+Y3eWAf2oki27nzsuft5ji9pgeVbbtBpOWN9i0qxOIz7kIgAAA" },
  { id: "ayr-flyer", series: "ayr", title: "AYR · Are You Ready?", src: "/portfolio/flyers/ayr-flyer.webp", width: 720, height: 1280, blur: "data:image/webp;base64,UklGRqAAAABXRUJQVlA4IJQAAABwBACdASoMABUAPu1iqU2ppaOiMAgBMB2JaACdMoAlsxgrFbEbNqkQXW1ZVAD+7t0Wizz2WDuUWKvxLqsglKcm6DENwzHoxei4AZnfNfqlX2BqBSSK9+N6i7aDvtGSl5cjGsZy0wlqrCZcmcqx9jl4lMQ+x7DlpZuodmtmVAgvCuCoAN5y5U8dkcoXWqO846UdZrgA" },
  { id: "ayr-teaser", series: "ayr", title: "AYR · Teaser", src: "/portfolio/flyers/ayr-teaser.webp", width: 720, height: 1280, blur: "data:image/webp;base64,UklGRqgAAABXRUJQVlA4IJwAAADwAwCdASoMABUAPu1iqU2ppaOiMAgBMB2JbACdMoACpf5BlBSyokIQAP7sTWRYlmkooQPoZDUa1MiTgKf0wkcC3B/ZIPvYUwcB0/CWkiyk6ng7Cpx4jEx+OBga0Z7y64SAUyl/VP1jW+SKjGqaL51W94gLunrPuKPwkWE4c3x35zzCCPelrB3EBJyamD0BJqQwK/bhgTBWqTFAAAA=" },
  { id: "firstclass-haupt", series: "firstclass", title: "First Class · Cabin Crew Special", src: "/portfolio/flyers/firstclass-haupt.webp", width: 720, height: 1280, blur: "data:image/webp;base64,UklGRoIAAABXRUJQVlA4IHYAAADwAwCdASoMABUAPu1iqU2ppaOiMAgBMB2JYgCdMoAC+nYqxUr/ZyCgAP7HaSe7Gsz1UrSTjzXAO7xkKb/2YJu2WOVFzzTjmuMe+Po30BSyzKnBiShhEFKXqL/LbuZ/fHgfH7c/rQGHXnKWPpd478Q/yh9YAAAA" },
  { id: "firstclass-crew", series: "firstclass", title: "First Class · Cabin Crews", src: "/portfolio/flyers/firstclass-crew.webp", width: 720, height: 1280, blur: "data:image/webp;base64,UklGRogAAABXRUJQVlA4IHwAAADQAwCdASoMABUAPu1iqU2ppaOiMAgBMB2JZQCw7Bt1vytd03KJUIAA/oWpxShFYFhNCCN6XvNKEVabE8lBONLlaPGlnEObiWGi/eFq1Js/zOmXAk6ZQv2QAFL6hNyET9jV/cNkzjrOtxuMKMVbX0ZGioTkyEq+lljxXwAA" },
  { id: "hnb-flyer", series: "hnb", title: "Hot'n Brownie · Belle Club", src: "/portfolio/flyers/hnb-flyer.webp", width: 720, height: 1280, blur: "data:image/webp;base64,UklGRpAAAABXRUJQVlA4IIQAAACwBACdASoMABUAPu1iqU2ppaOiMAgBMB2JaACdMoMlwcAAwiQJLwowMQWUeYgAAP7vZ3eJa+1Be3wPT2Nu23HuXg9szLinPS+jiHjMF7HE6pmK0vwUqVsLA4Sb8jXqn6GEeXJmtmDAhupmoq5MnIcOxq617cBjIYMIh4wx/6pzUzPLqAA=" },
  { id: "hnb-liar-teaser", series: "hnb", title: "Hot'n Brownie · Teaser", src: "/portfolio/flyers/hnb-liar-teaser.webp", width: 720, height: 1280, blur: "data:image/webp;base64,UklGRqIAAABXRUJQVlA4IJYAAABwBACdASoMABUAPu1iqU2ppaOiMAgBMB2JbACdMoR3IsAAs44p4IcDILDXoAD+pVGPbr9pcAHpQToWNjMPBFtph+Mg2/Vu/reWrIacnepcjo+Fv+JPn//fgD345Yyg1175aC4ejiLPptl+evZWunqK/g6P1qljK/zB1r/g7yPsnKObR9eoiu8I2hOxPJz3X0BBFcgAAAA=" },
  { id: "jade-ggg-planet", series: "jade", title: "Jade · Girls Girls Girls", src: "/portfolio/flyers/jade-ggg-planet.webp", width: 720, height: 1280, blur: "data:image/webp;base64,UklGRpgAAABXRUJQVlA4IIwAAADQAwCdASoMABUAPu1iqU2ppaOiMAgBMB2JaACdAYs2sqb+fx7/u7AA/mo6puqZlLzWVJfyryWMHrpq+QwhUTNYjEbmCQxbH1kR//RQc2KwnsBb+jHVL3YYv6JMCBareYaS/hx17/42+4Wq8ZtDyGLZ1uX2FCUKGY+EfVenAcDxq0WVu6JpD9esmu4AAA==" },
  { id: "money-neby", series: "money", title: "Money Talkz · Friday", src: "/portfolio/flyers/money-neby.webp", width: 720, height: 1280, blur: "data:image/webp;base64,UklGRn4AAABXRUJQVlA4IHIAAADQAwCdASoMABUAPu1iqU2ppaOiMAgBMB2JZQAAW78sOv6gP+X/40AA/u8oSPK6LPx6vvU6waa7HNPiggwIS1R1X4oTM3eDAwS8tLNuQ6ZmV6vvvb7zvdi50q9Pxn5A8MCeNjO9IUXvM7tyMzUSPwhMgAA=" },
  { id: "money-sept", series: "money", title: "Money Talkz · Sept Night", src: "/portfolio/flyers/money-sept.webp", width: 720, height: 1280, blur: "data:image/webp;base64,UklGRo4AAABXRUJQVlA4IIIAAABQBACdASoMABUAPu1iqU2ppaOiMAgBMB2JZwDImywBhezNIeq3Cw+hO4mAAP7s5xDGtgyJf72tJGjEuTo2ZeJsRUyVzA5Ei4h9nwegJpGAieyZT4FPtuC9US6+zVG7xEoGu8kqiqvyLCoFUZcf5UamSwFEuqIcjo3ove89VGB/AAAA" },
  { id: "nonstop-teaser", series: "nonstop", title: "Nonstop Events · Vanity", src: "/portfolio/flyers/nonstop-teaser.webp", width: 720, height: 1280, blur: "data:image/webp;base64,UklGRmwAAABXRUJQVlA4IGAAAABwAwCdASoMABUAPu1iqU2ppaOiMAgBMB2JZQAAXlvBz0pNbAAA/vKlTHy9NYlNNuhb5tsSKD+Ibv2WkIa/DA2ICUy1uNuYhtxbycqyRm8gAToX6Lce9dmDIs282NeQgAA=" },
  { id: "vibe-flyer", series: "vibe", title: "Vibe · Reopening", src: "/portfolio/flyers/vibe-flyer.webp", width: 720, height: 1280, blur: "data:image/webp;base64,UklGRpwAAABXRUJQVlA4IJAAAABQBACdASoMABUAPu1iqU2ppaOiMAgBMB2JYgCdAYu43FHhLyP6+Vkb8hagAP6FE/ReStpRmNwP/Pcefux3xIg3hEjP8GyENX1eaM/h0ustOXlARxPPe8HfWhzgkglsET3P2o10pJ//uOIjh9CCNnW49O1b0eT2PYU3IKzv3GboILYL4CKaS1XIDXywHtwAAAA=" },
  { id: "vibe-reopening", series: "vibe", title: "Vibe · Reopening Festival", src: "/portfolio/flyers/vibe-reopening.webp", width: 720, height: 1280, blur: "data:image/webp;base64,UklGRqYAAABXRUJQVlA4IJoAAAAQBACdASoMABUAPu1iqU2ppaOiMAgBMB2JbACdMoADReEQ6HWSR3mzwAD+CO5l6pm2YBZ64NUUGKhEpyDNF78FggTIaV6WksXujva4Quir5rtOZaSRiFOBwg7LFGGEAoEFEUcN08/3xgZvt2fpQA49dn+vYpU3zPoX/2Pr71Sqks3HLUUwHm1+shwskqCNRWxzKx4rM9qx+KAA" },
  { id: "vibe-russki", series: "vibe", title: "Vibe · Russki Rave", src: "/portfolio/flyers/vibe-russki.webp", width: 720, height: 1280, blur: "data:image/webp;base64,UklGRoYAAABXRUJQVlA4IHoAAAAwBACdASoMABUAPu1iqU2ppaOiMAgBMB2JZAC7LwAB0bfrT0GvoWbd7IAA/tb0hVASRRjtIHBBkgIlhl7PY1se4+I0MAioRyovcsMbjAcLJLdWWGKsfswIAj+TchGnzboaeuHWl3kq17j0eTc6XWi0eIFSsXyJusXgAA==" },
  { id: "wuwh-dawn", series: "wuwh", title: "WUWH · The Dawn", src: "/portfolio/flyers/wuwh-dawn.webp", width: 720, height: 1280, blur: "data:image/webp;base64,UklGRnYAAABXRUJQVlA4IGoAAADQAwCdASoMABUAPu1iqU2ppaQiMAgBMB2JYwCo9CB+JJefj+5UgGAA/rO1iStnbflPlzg4gf6q9XL0zg4eFzHmffvHkqMLayzXjINRDPhe6cDPPnXuMLwAiZ54QPTDoZo53pm/xlURhgAA" },
  { id: "ayr-geek", series: "ayr", title: "Geek · Liveshow", src: "/portfolio/flyers/ayr-geek.webp", width: 720, height: 1280, blur: "data:image/webp;base64,UklGRmgAAABXRUJQVlA4IFwAAACwAwCdASoMABUAPxFysFAsJqSisAgBgCIJYgAAUqbem2EaJ1JmAAD+6O0jnxjjz3zbQuaDY0nDyt1Cv8iUhtQyj0IlAk6W0Pwa5HsvkQ98jG+tVtFxd2BBy3MQAA==" },
  { id: "louve-elcielo", series: "louve", title: "La Louve · El Cielo Night", src: "/portfolio/flyers/louve-elcielo.webp", width: 720, height: 1280, blur: "data:image/webp;base64,UklGRmAAAABXRUJQVlA4IFQAAACwAwCdASoMABUAPxFysVAsJqSisAgBgCIJZQAAXfEfXB3hBLy4AAD+yLev7erAdCVaMdHH8WCPkw7cknR/ZUX5+4sP1bXSODIRooj46ZWmjwBB8AA=" },
  { id: "tika-island", series: "tika", title: "Tika Island · Island of Love", src: "/portfolio/flyers/tika-island.webp", width: 720, height: 1280, blur: "data:image/webp;base64,UklGRl4AAABXRUJQVlA4IFIAAADwAwCdASoMABUAPxFysFAsJqSisAgBgCIJYwCdMvIDY/AT8whB+HBYAP7f0YsO8iUXmjJQMl6uCzBEqECk45hXCgaXDzz69GFyf490MJE8NsAA" },
  { id: "hnb-belle", series: "hnb", title: "Hot'n Brownie · Belle Club", src: "/portfolio/flyers/hnb-belle.webp", width: 720, height: 1280, blur: "data:image/webp;base64,UklGRnQAAABXRUJQVlA4IGgAAACwAwCdASoMABUAPxFysFAsJqSisAgBgCIJZACdACHSF0e5soSIAAD+6TaYalI1Z2UB6V0YWnEcROnXRUWdVPUT72AvSCW9IGV1SUghg3Ya7M+Ryc1/qN2Qr7qSQejeZ8eie7UDtAAAAA==" },
  { id: "hnb-presents", series: "hnb", title: "Hot'n Brownie · Presents", src: "/portfolio/flyers/hnb-presents.webp", width: 720, height: 1280, blur: "data:image/webp;base64,UklGRqYAAABXRUJQVlA4IJoAAACwBACdASoMABUAPxFysFAsJqSisAgBgCIJZgCdL1yagJnsXpxZhtKCP1uvsN2AAPY0lSPi+4CJONKYj/rhihF7ZoP5Iy6Zoslw3pC3XME6QHRa489cGr3q+Jsvjg/xqW/58IfuhAcT8jKzsffs1c8mVf8DpCw9QCjdW9rvQ8yRg/5X7kdo//huXlP6AFR7vEppe2DlokiT1oQA" },
  { id: "hnb-opening", series: "hnb", title: "Hot'n Brownie · Summer Opening", src: "/portfolio/flyers/hnb-opening.webp", width: 720, height: 1280, blur: "data:image/webp;base64,UklGRoYAAABXRUJQVlA4IHoAAAAQBACdASoMABUAPxFysFAsJqSisAgBgCIJZgCdMoACqumAx+yCyNWaAAD+r8obL8Xhx9PxYcNqvsYnX2eGsZGZCEDX7738CWKXjSimDSfhlI2Aj9CvnQVUBcVEtfAO87jGYPxdF0tB6XlQuRFBAbueZOxwK29j/uAAAA==" },
  { id: "kalim-liveshow", series: "kalim", title: "Kalim · Liveshow", src: "/portfolio/flyers/kalim-liveshow.webp", width: 720, height: 1280, blur: "data:image/webp;base64,UklGRoIAAABXRUJQVlA4IHYAAABQBACdASoMABUAPxFysFAsJqSisAgBgCIJZQAIEAPvU6mHT7nMlqJypeQAAP7Ma2hQZc14E0vN6sfLBXYeZmKpTxmNIcO70enPFejmI5UgCeqCcCV84A5KHn8H/aEpjcvBrmg0uRcSOBDO06xCBdkZfGcUAAAA" },
  { id: "boat-party", series: "boat", title: "The Boat Party", src: "/portfolio/flyers/boat-party.webp", width: 720, height: 1280, blur: "data:image/webp;base64,UklGRn4AAABXRUJQVlA4IHIAAACQAwCdASoMABUAPxFysFAsJqSisAgBgCIJZAAAXGkqhqmVachgAP5ruAz23kgAHHpRgCuUEkrhfwNikERG0w7Fe3syr8cBhZn1e9bt/Mu5gCCkaQuLR0jrqRyjWTVFFj0Y/EvAqCiN41Gg5LidgL3AAAA=" },
  { id: "margiela-kiki", series: "margiela", title: "Margiela Events · Kiki", src: "/portfolio/flyers/margiela-kiki.webp", width: 720, height: 1280, blur: "data:image/webp;base64,UklGRoAAAABXRUJQVlA4IHQAAAAQBACdASoMABUAPxFwsFAsJiSisAgBgCIJQBOgBEDDWHVO1Bf3HQLR4AD+6fn61qJZyK7UxkL3T6hzMWwfCke7xhH4OqQ5cgBZ5UvgfTVpVfMk6TJlImhLjtT2XLY3jGdaZAww3e0vwl4B6GqbItFd6PAAAA==" },
  { id: "ayr-silvester", series: "ayr", title: "Geek · Silvester", src: "/portfolio/flyers/ayr-silvester.webp", width: 720, height: 1280, blur: "data:image/webp;base64,UklGRlgAAABXRUJQVlA4IEwAAACQAwCdASoMABUAPxFysFAsJqSisAgBgCIJQBadA22lscajh0JAAP6DOXslkuMnkkVhCht9pUNlgbmB1bHjdCoqstdruOG2eYWo4AAA" },
];

export const galleryMotion: GalleryMotion[] = [
  { id: "hnb", series: "hnb", title: "Hot'n Brownie", video: "/portfolio/motion/hnb.mp4", poster: "/portfolio/motion/hnb.webp", blur: "data:image/webp;base64,UklGRlwAAABXRUJQVlA4IFAAAACwAwCdASoMABUAPu1kqU2ppaOiMAgBMB2JYwCdACFsBj3LcA2FgAD+72F3irpgi55P7MpGeELWzqj9bTeZJzW+JdRQ17A2ueHmSkTZitHkAA==" },
  { id: "ayr", series: "ayr", title: "AYR · Are You Ready?", video: "/portfolio/motion/ayr.mp4", poster: "/portfolio/motion/ayr.webp", blur: "data:image/webp;base64,UklGRqoAAABXRUJQVlA4IJ4AAABwBACdASoMABUAPu1iqU2ppaOiMAgBMB2JbACdAYtK33V48VTexKHnVgRcQAD+6aOpkmvKxVANQu4SmODTfZqTColl5PX/12VfvveET6NnqypWSZinfmRlQ4K58OQhNH2R3T1rmimvE+dRKtFhmVGIf53tP/BR3vfwF0Cbfe1b4v/JZTcbkiLW1/1g+YyW2sPAaxbzRBmbPLOetErgAA==" },
  { id: "russki", series: "vibe", title: "Vibe · Russki Rave", video: "/portfolio/motion/russki.mp4", poster: "/portfolio/motion/russki.webp", blur: "data:image/webp;base64,UklGRnwAAABXRUJQVlA4IHAAAAAQBACdASoMABUAPu1iqU2ppaOiMAgBMB2JYgC7Ef/gMP1NWiDzwHPgMAD8z9RBOpvfcdFyeH7UinGPBH8bskm+0bacdH+IwHO0XeeWj1l0+CbZB+FnIFEZ2ZmLT/ny99tmf1epwZonuNDN5XTpCAAA" },
  { id: "wuwh", series: "wuwh", title: "WUWH · The Dawn (3D)", video: "/portfolio/motion/wuwh.mp4", poster: "/portfolio/motion/wuwh.webp", blur: "data:image/webp;base64,UklGRpIAAABXRUJQVlA4IIYAAAAwBACdASoMABUAPu1iqU2ppaOiMAgBMB2JaQAD5bndeLiArDa1DaYTeIAA/uc/XM8Echbh0qS+B6DDHhhwG/AH5pGOXwBZqX2DifIk6y2f2PVbj7U91Gi1iusamL4erBs1Mn7DQvrWd7de5/oL/5qf8JtDsbqQSj95ttPArboruzpGZAAAAA==" },
  { id: "money", series: "money", title: "Money Talkz", video: "/portfolio/motion/money.mp4", poster: "/portfolio/motion/money.webp", blur: "data:image/webp;base64,UklGRqQAAABXRUJQVlA4IJgAAADwAwCdASoMABUAPu1iqU2ppaOiMAgBMB2JZgCdAYyAdeKqoAcQuMsAAP6mrA1TLWdcub6vL8ZUlHZNpwqSVgwqqGp16aBq+nqNF2jNRbdtFkMm7c0TvSEcSkCqr4ij50ry5GB65dHJ9gdG//b48oC8n2l2u4Wglel8Omlo8IO6i9aanFELxVeG46VZUllMC0MvgIRGWAAAAA==" },
  { id: "urban", series: "blessed", title: "Urban Night", video: "/portfolio/motion/urban.mp4", poster: "/portfolio/motion/urban.webp", blur: "data:image/webp;base64,UklGRowAAABXRUJQVlA4IIAAAAAwBACdASoMABUAPu1iqU2ppaQiMAgBMB2JZACdMoAC/B6acBuEwvWDZ4AA/uwRhiPj98E22SmvlN7jtphGcFz42areUXz4qMOx8UEGiJcelPOZmSazQXN6+DwU9xp2Y4s9C0LR5C+FtA2873VXt93AjEaQf5VY1IirHPedTAAAAA==" },
  { id: "badbunny", series: "blessed", title: "Bad Bunny Night", video: "/portfolio/motion/badbunny.mp4", poster: "/portfolio/motion/badbunny.webp", blur: "data:image/webp;base64,UklGRqQAAABXRUJQVlA4IJgAAABQBACdASoMABUAPu1iqU2ppaOiMAgBMB2JbACdMoGv/gJLMmI6T52uTpjAAP7usaiuyBNEfmkypb25j5tEcJI0u+kfJHWAUwvFHlQXc5xaHO67FitzQ9ARxQ6exE/qZZSoHQa/ZUKZw8CsxS+O2vsxauYGZMvzSzGLwFs9vV2zsNQyiRH8zU14Dz3g3M0U2P9PFzBiBAAAAA==" },
  { id: "albanien", series: "blessed", title: "Albanien Night", video: "/portfolio/motion/albanien.mp4", poster: "/portfolio/motion/albanien.webp", blur: "data:image/webp;base64,UklGRoYAAABXRUJQVlA4IHoAAAAQBACdASoMABUAPu1iqU2ppaOiMAgBMB2JZACdAB6Vr9NTGtcfkojOwAD+7rGorsc3jGSp0+K/5R88Vqzun3QYA+YDCMMvfOMUZgbvm/UOF+I3MYYC8i8CG8Sr1gqfAKw28IrzyIhqOf8eTKR/m+owTgWVIDe82BgAAA==" },
  { id: "noizy", series: "noizy", title: "Noizy · Liveshow", video: "/portfolio/motion/noizy.mp4", poster: "/portfolio/motion/noizy.webp", blur: "data:image/webp;base64,UklGRooAAABXRUJQVlA4IH4AAADQAwCdASoMABUAPxFysFAsJqSisAgBgCIJYgC7ABssnO1ScV3RCoAA+KKFfP+0U/bUso8izsFF6A9AV8Oak/SIbiadJwPiJWYUOnJYjBnXN9iJUxdVpWa86tm02bcrxfjkcm9Mwi3cV1Fudmbb9IzB8zJ2j2HxnHNQ8g9mgAA=" },
  { id: "nobless", series: "nobless", title: "Nobless 3 · Club Three", video: "/portfolio/motion/nobless.mp4", poster: "/portfolio/motion/nobless.webp", blur: "data:image/webp;base64,UklGRlwAAABXRUJQVlA4IFAAAACwAwCdASoMABUAPxFwsFAsJiSisAgBgCIJZQAAW9NawaWh0IrgAAD+6OH5kidCsH6LpQ8nz1mDSG973lvhrHVdfbcr63S8KZQCmX6jKRnAAA==" },
  { id: "halloween", series: "halloween", title: "TTwinz & Friends · Halloween", video: "/portfolio/motion/halloween.mp4", poster: "/portfolio/motion/halloween.webp", blur: "data:image/webp;base64,UklGRnoAAABXRUJQVlA4IG4AAACQAwCdASoMABUAPxFysFAsJqSisAgBgCIJagCw7Bq1pQBAkSEAAP2jwSFXeV62vyUbUuYfr6ebvljvm2BbtLWnnEDTHg5arIatEGE67kxHycwtk3ZCltqQ7RDRvxIuaODunhaoMkoNRvRaQAAAAA==" },
  { id: "kalim", series: "kalim", title: "Kalim · Liveshow", video: "/portfolio/motion/kalim.mp4", poster: "/portfolio/motion/kalim.webp", blur: "data:image/webp;base64,UklGRrIAAABXRUJQVlA4IKYAAAAwBACdASoMABUAPxFysFAsJqSisAgBgCIJbACdGaAAYENGNTQ0quWSMYAA/uzZVmztWb1lhhHzrIupfhlNzPVgeqvPqVPN896MlhPkmyjaSlsU9E8tAyvs7z83tlH03RMra3C/IuGJNdVvQDx4x45pX2GLg0MDu7tfsyQSdsjj3cUHFxMKqZYAcdPIvrliy/OOFTn/v3H+Pf6grsiwwjm0+IeTAAAA" },
  { id: "louve-7", series: "louve", title: "La Louve · 7 Jahre", video: "/portfolio/motion/louve-7.mp4", poster: "/portfolio/motion/louve-7.webp", blur: "data:image/webp;base64,UklGRlwAAABXRUJQVlA4IFAAAACwAwCdASoMABUAPxFysFAsJqSisAgBgCIJZQDKACHmvq8s+4GmAAD+5AUv9IE9HPinncUPYwxqzn8KiODD+GyP4KXAhGkfkb7L25wYtXnoAA==" },
  { id: "louve-zirkus", series: "louve", title: "La Louve · Zirkus-Teaser", video: "/portfolio/motion/louve-zirkus.mp4", poster: "/portfolio/motion/louve-zirkus.webp", blur: "data:image/webp;base64,UklGRmYAAABXRUJQVlA4IFoAAACwAwCdASoMABUAPxFysFCsJqSisAgBgCIJaACdMoADQsRrb3jliAD9+UPFaBL+ABb5rmo05uaCTbpJjTIEGM9UxE9q7CEdXRHXtU2Q8jIyp8fDMoGOQ59sAAA=" },
  { id: "culture", series: "culture", title: "Culture · Aftermovie", video: "/portfolio/motion/culture.mp4", poster: "/portfolio/motion/culture.webp", blur: "data:image/webp;base64,UklGRnAAAABXRUJQVlA4IGQAAAAQBACdASoMABUAPxFysFAsJqSisAgBgCIJZACdMoADTOGnSJCAO8FEQAD+7ohJUHH7GgwRGrAj6jbC2JChU0oFMhpa01aGIkMXaW+q1JNFhwu1RCVd4BhqhfO1Rbf0ckx8zxgA" },
];
