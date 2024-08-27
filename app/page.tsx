// app/page.tsx
// import ContactUs from './components/ContactUs';
import Hero from './components/Hero';
import Impact from './components/Impact';
import KnowledgeHub from './components/KnowledgeHub';
import Solutions from './components/Solutions';

export default function Home() {
  return (
    <main>
      <Hero />
      <Solutions/>
      <Impact/>
      <KnowledgeHub/>
      {/* <ContactUs/> */}
      {/* Add other sections here */}
    </main>
  );
}