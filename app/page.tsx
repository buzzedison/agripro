// app/page.tsx
// import ContactUs from './components/ContactUs';
import Hero from './components/Hero';
import Impact from './components/Impact';
import KnowledgeHub from './components/KnowledgeHub';
import Solutions from './components/Solutions';
import GreenMarketPromo from './components/GreenMarketPromo'
import FarmSmartTeaser from './components/FarmSmartTeaser'

export default function Home() {
  return (
    <main>
      <Hero />
      <Solutions/>
      <Impact/>
      <KnowledgeHub/>
      <GreenMarketPromo />
      <FarmSmartTeaser />
      {/* <ContactUs/> */}
      {/* Add other sections here */}
    </main>
  );
}