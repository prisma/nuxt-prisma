// https://github.com/nuxt-themes/docus/blob/main/nuxt.schema.ts
export default defineAppConfig({
  docus: {
    title: "Nuxt Prisma",
    description: "Add Prisma ORM easily to your Nuxt apps.",
    image: "/cover.png",
    socials: {
      twitter: "prisma",
      github: "prisma/nuxt-prisma",
      nuxt: {
        label: "Nuxt",
        icon: "simple-icons:nuxtdotjs",
        href: "https://nuxt.com",
      },
    },
    aside: {
      level: 0,
      collapsed: false,
      exclude: [],
    },
    main: {
      padded: true,
      fluid: true,
    },
    header: {
      logo: true,
      showLinkIcon: true,
      exclude: [],
      fluid: true,
    },
  },
});
