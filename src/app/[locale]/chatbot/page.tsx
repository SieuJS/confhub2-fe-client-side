import AIAbilities from "../components/landingChatbot/AIAbilities";
import AIAbout from "../components/landingChatbot/AIAbout";
import AIBanner from "../components/landingChatbot/AIBanner";
import AIBanner2 from "../components/landingChatbot/AIBanner2";
import AIFAQ from "../components/landingChatbot/AIFAQ";
import AIStatistics from "../components/landingChatbot/AIStatistics";


export default function AILanding() {
  return (
    <div className="bg-black">
      <AIBanner />
      {/* <AIBanner2 /> */}
      <AIAbout />
      {/* <AIAbilities /> */}
      <AIStatistics />
      <AIFAQ />
    </div>
  );
}