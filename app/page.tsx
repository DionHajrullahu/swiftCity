export default function Home() {
  return (
    <main className="min-h-screen bg-white text-gray-900">
      
      {/* Hero Section */}
      <section className="px-6 py-20 text-center">
        <h1 className="text-5xl font-bold mb-6">
          Discover Cities Through Local Insight
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
          SwiftCity helps travelers find trustworthy, interest-based recommendations
          from verified locals — fast, simple, and authentic.
        </p>
        <button className="px-6 py-3 bg-black text-white rounded-full text-lg hover:bg-gray-800 transition">
          Explore a City
        </button>
      </section>

      {/* How It Works */}
      <section className="bg-gray-50 px-6 py-16">
        <h2 className="text-3xl font-semibold text-center mb-12">
          How SwiftCity Works
        </h2>

        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div>
            <h3 className="text-xl font-semibold mb-2">Verified Locals</h3>
            <p className="text-gray-600">
              Every recommendation comes from trusted local contributors,
              not anonymous reviews.
            </p>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-2">Interest-Based Filters</h3>
            <p className="text-gray-600">
              Filter by food, culture, budget, vibe, and more — no popularity bias.
            </p>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-2">Fast Decisions</h3>
            <p className="text-gray-600">
              Short, scannable suggestions designed for travelers on the go.
            </p>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="px-6 py-20 text-center">
        <h2 className="text-3xl font-semibold mb-4">
          Travel Smarter. Travel Local.
        </h2>
        <p className="text-gray-600 mb-8">
          Stop scrolling reviews. Start exploring with confidence.
        </p>
        <button className="px-6 py-3 border border-black rounded-full text-lg hover:bg-black hover:text-white transition">
          Join Early Access
        </button>
      </section>

    </main>
  );
}