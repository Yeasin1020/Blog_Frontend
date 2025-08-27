import AboutSection from "./about/page";
import BlogList from "./components/BlogList";
import Hero from "./components/Hero";

export default function Home() {
  return (
    <div>
      <Hero></Hero>
      <BlogList></BlogList>
      <AboutSection></AboutSection>
    </div>
  );
}
