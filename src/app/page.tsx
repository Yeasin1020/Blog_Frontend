import AboutSection from "./about/page";
import BlogList from "./components/BlogList";
import Hero from "./components/Hero";
import ContactPage from "./contact/page";

export default function Home() {
  return (
    <div>
      <Hero></Hero>
      <BlogList></BlogList>
      <AboutSection></AboutSection>
      <ContactPage></ContactPage>
    </div>
  );
}
