export const BRAND = {
  name: "BRIJ DHARA",
  legalName: "BRIJ DHARA REALTECH (PVT) LTD",
  tagline: "A LAND OF YOUR DREAM HOME",
  yearsOfTrust: 11,
  contact: {
    phones: ["7055505641", "9719369022", "7037907338", "6395831773", "9675173298"],
    email: "brijdhararealtech@gmail.com",
    address: "Brij Dhara Corporate Hub, NH-2, Mathura, UP 281001"
  }
};

export const IMAGES = {
  logo: "/logo.png",
  hero: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80",
  heroVideo: "/hero.mp4",
  atrium: "https://images.unsplash.com/photo-1486406146926-c627a92fb1ab?auto=format&fit=crop&q=80",
  map: "https://lh3.googleusercontent.com/aida-public/AB6AXuA3nmyJfCceuBlIFDYMpBlrcpdH6Hb7tkTD-GD82GkB7bmPlRu-uHQs4epwOVeEdsu4J_Ycvvy41qb5hJuk7aeHHvTUoJ5fG_nVjeWyPrv1fMilAIGF6LYTICzEdJjG0LSs8gtl2oOiU5Vw9T9Bvzj64h3KEFMOdZ5kFoRO2mSiHplhiTmfKsofvMIDuSWLw1wk6h5CrDanj39vad0qQxPGCpnBopKkELC33zNZdBuO4t6AW3xgYMdJP0hQ0tFaZZz5ZUigQcYPT3Pz",
  projects: {
    kanhaKunj: "https://images.unsplash.com/photo-1590066304602-4f7e0c9f36a3?auto=format&fit=crop&q=80",
    hetvikPlaza: "https://images.unsplash.com/photo-1486406146926-c627a92fb1ab?auto=format&fit=crop&q=80",
    brijTown: "https://images.unsplash.com/photo-1582407947304-fd86f028f716?auto=format&fit=crop&q=80",
    brijGreen: "https://images.unsplash.com/photo-1524813685445-3e1a3bb6b90d?auto=format&fit=crop&q=80"
  },
  director: "/director.jpg"
};

export const PROJECTS = [
  { 
    id: "kanha-kunj",
    name: "Kanha Kunj", 
    type: "Residential", 
    image: IMAGES.projects.kanhaKunj, 
    video: "https://assets.mixkit.co/videos/preview/mixkit-flying-over-a-large-city-at-night-40348-large.mp4",
    desc: "A cinematic retreat in the heart of Mathura.",
    location: "Near NH-2",
    badge: "Limited Plots Available",
    roi: 1.18
  },
  { 
    id: "hetvik-plaza",
    name: "Hetvik Plaza", 
    type: "Commercial", 
    image: IMAGES.projects.hetvikPlaza, 
    video: "https://assets.mixkit.co/videos/preview/mixkit-aerial-view-of-a-modern-city-with-skyscrapers-34421-large.mp4",
    desc: "Where business meets architectural grandeur.",
    location: "Vrindavan Region",
    badge: "Prime Location",
    roi: 1.25
  },
  { 
    id: "brij-town",
    name: "Brij Town", 
    type: "Residential", 
    image: IMAGES.projects.brijTown, 
    video: "https://assets.mixkit.co/videos/preview/mixkit-aerial-view-of-a-residential-area-with-houses-34419-large.mp4",
    desc: "Defining the skyline of the legacy city.",
    location: "Mathura-Bareilly Highway",
    badge: "Mega Township",
    roi: 1.15
  },
  { 
    id: "brij-green",
    name: "Brij Green Highway", 
    type: "Residential", 
    image: IMAGES.projects.brijGreen, 
    video: "https://assets.mixkit.co/videos/preview/mixkit-flying-over-a-dense-forest-1254-large.mp4",
    desc: "Eco-conscious living by the expressway.",
    location: "Jawahar Toll Plaza",
    badge: "Near NH-2",
    roi: 1.20
  }
];
