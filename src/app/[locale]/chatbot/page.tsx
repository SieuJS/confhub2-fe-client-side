import AIBanner from "../components/landingChatbot/AIBanner";
import AIFAQ from "../components/landingChatbot/AIFAQ";


export default function AILanding() {
  return (
    <div className="bg-black">
      <AIBanner />
      <AIFAQ />
    </div>
  );
}