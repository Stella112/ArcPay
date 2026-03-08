import { Navbar } from '@/components/Navbar';
import { PayoutCard } from '@/components/PayoutCard';

export default function Home() {
  return (
    <>
      {/* Animated background layers */}
      <div className="bg-mesh" aria-hidden="true">
        <div className="bg-blob-mid" />
      </div>
      <div className="bg-noise" aria-hidden="true" />

      {/* App shell */}
      <div className="app-wrapper">
        <Navbar />
        <main className="main-content">
          <PayoutCard />
        </main>
      </div>
    </>
  );
}
