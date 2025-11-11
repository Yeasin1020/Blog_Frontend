import CategorySpotlight from "../components/Category";
import HeroSlider from "../components/Hero";
import HotDeal from "../components/HotDeal";

export default function Home() {
  return (
    <div>
      <HeroSlider></HeroSlider>
      <CategorySpotlight></CategorySpotlight>
      <HotDeal></HotDeal>
    </div>
  );
}
