import { cmsUrl } from "../api/config";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Carousel from "../components/Carousel";
import { fetchLandingSections } from "../api/strapi";

function descriptionText(description) {
  if (typeof description === "string") return description;
  const text = node => typeof node.text === "string" ? node.text : (node.children || []).map(text).join("");
  return Array.isArray(description) ? description.map(text).join(" ") : "";
}

const categories = [
  { name: "Mobile phones", path: "/mobile", label: "Stay connected", type: "phone", description: "Big possibilities. Pocket-sized." },
  { name: "Laptops", path: "/laptop", label: "Make things happen", type: "laptop", description: "For your next big idea." },
  { name: "Accessories", path: "/accessories", label: "The finishing touches", type: "audio", description: "Small details. Everyday difference." },
];
function Device({ type }) {
  return <div className={`device-art ${type}`} aria-hidden="true">{type === "phone" ? <div className="phone-body"><div className="phone-camera"/><div className="phone-screen"/></div> : type === "laptop" ? <><div className="laptop-screen"><div/></div><div className="laptop-base"/></> : <><div className="headphone-band"/><div className="ear left"/><div className="ear right"/></>}</div>;
}
export default function Home() {
  const [sections, setSections] = useState([]);
  const [cmsLoading, setCmsLoading] = useState(true);
  const [cmsError, setCmsError] = useState("");
  useEffect(() => {
    let active = true;
    fetchLandingSections().then(data => {
      if (active) setSections(Array.isArray(data) ? data : []);
    }).catch(() => {
      if (active) setCmsError("Featured content is temporarily unavailable.");
    }).finally(() => { if (active) setCmsLoading(false); });
    return () => { active = false; };
  }, []);
  const slides = sections.map(item => {
    const image = Array.isArray(item.Image) ? item.Image[0] : item.Image;
    return { heading: item.Title, subheading: descriptionText(item.Description),
      image: image?.url ? cmsUrl(image.url) : undefined, bgColor: "#28566a", to: "/products" };
  });
  return <div className="home-page">
    {cmsLoading ? <p role="status">Loading featured content…</p> : cmsError ? <p role="status">{cmsError}</p> : slides.length > 0 && <section className="home-carousel" aria-label="Featured collections"><Carousel slides={slides} autoplay interval={5000} /></section>}
    <section className="hero">
      <div className="hero-copy"><span className="eyebrow"><span/> A fresh take on everyday tech</span><h1>Good tech.<br/>Great possibilities<span>.</span></h1><p>Discover the phones, laptops, and little extras that make your everyday a little better.</p><div className="hero-actions"><Link className="primary-link" to="/mobile">Explore the collection <span>↗</span></Link><Link className="text-link" to="/laptop">Find your laptop →</Link></div><div className="hero-note"><span>✦</span> A new favorite is just a click away</div></div>
      <div className="hero-visual"><div className="orb"/><div className="hero-product"><Device type="phone"/></div><span className="floating-label top">Designed for your everyday</span><span className="floating-label bottom"><span>✦</span> Discover what’s next</span><span className="visual-caption">THE EVERYDAY EDIT / 01</span></div>
    </section>
    <div className="benefit-strip"><span><b>01</b> Discover your next upgrade</span><span><b>02</b> Compare the details</span><span><b>03</b> Make it yours</span></div>
    <section className="collection-section"><div className="section-heading"><div><span className="eyebrow">Made for the way you live</span><h2>Find your kind of tech.</h2></div><p>Big ideas to everyday essentials.<br/>Start with what you love.</p></div><div className="category-grid">{categories.map(c => <Link className={`category-card ${c.type}`} to={c.path} key={c.path}><div className="category-card-top"><span>{c.label}</span><span className="circle-arrow">↗</span></div><Device type={c.type}/><div><h3>{c.name}</h3><p>{c.description}</p></div></Link>)}</div></section>
    {sections.length > 0 && <section className="collection-section"><div className="section-heading"><h2>A little inspiration.</h2></div><div className="category-grid">{sections.map(item => <article className="editorial-card" key={item.id}>{item.Image?.[0] && <img loading="lazy" src={cmsUrl(item.Image[0].formats?.small?.url || item.Image[0].url)} alt={item.Image[0].alternativeText || item.Title}/>}<h3>{item.Title}</h3><p>{Array.isArray(item.Description) ? item.Description.map(b => b.children?.map(c => c.text).join("")).join(" ") : item.Description}</p></article>)}</div></section>}
    <section className="explore-banner"><div><span className="eyebrow">Little things. Big difference.</span><h2>Complete your everyday.</h2><p>Meet the accessories that bring it all together.</p></div><Link className="primary-link" to="/accessories">Explore accessories ↗</Link></section>
  </div>;
}
