import Link from "next/link";

export default function HomePage() {
  const categories = [
    { name: "Mathematics", icon: "∑", color: "bg-gradient-to-br from-blue-500 to-blue-700" },
    { name: "Science", icon: "⚗️", color: "bg-gradient-to-br from-emerald-500 to-green-600" },
    { name: "History", icon: "🏛️", color: "bg-gradient-to-br from-amber-500 to-orange-600" },
    { name: "Geography", icon: "🌎", color: "bg-gradient-to-br from-cyan-500 to-teal-600" },
    { name: "Programming", icon: "💻", color: "bg-gradient-to-br from-violet-500 to-purple-600" },
    { name: "Languages", icon: "🗣️", color: "bg-gradient-to-br from-pink-500 to-rose-600" },
    { name: "General", icon: "🎓", color: "bg-gradient-to-br from-slate-600 to-gray-700" },
  ];

  const recentQuizzes = [
    { title: "Algebra Basics", category: "Mathematics", participants: 234, edited: "5 days ago" },
    { title: "Chemistry Fundamentals", category: "Science", participants: 189, edited: "1 week ago" },
    { title: "World History Timeline", category: "History", participants: 312, edited: "2 days ago" },
    { title: "JavaScript ES6+", category: "Programming", participants: 456, edited: "Today" },
    { title: "French Vocabulary", category: "Languages", participants: 127, edited: "3 weeks ago" },
    { title: "Geography Trivia", category: "Geography", participants: 278, edited: "1 month ago" },
  ];

  const stats = [
    { label: "Quizzes Created", value: "128", color: "text-blue-400" },
    { label: "Total Participants", value: "5.2K", color: "text-emerald-400" },
    { label: "Avg. Score", value: "87%", color: "text-amber-400" },
    { label: "Hours Spent", value: "142", color: "text-purple-400" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* Hero Section */}
      <section className="relative px-6 py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-transparent to-purple-900/20"></div>
        <div className="relative max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Create quizzes that
            <span className="block mt-2 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              engage and inspire
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-10 max-w-3xl mx-auto">
            Design interactive quizzes with our intuitive tools. Perfect for educators, 
            trainers, and teams looking to make learning fun.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link
              href="/create"
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold text-lg rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
            >
              🚀 Start Creating
            </Link>
            <Link
              href="/templates"
              className="px-8 py-4 bg-gray-800 text-white font-bold text-lg rounded-xl hover:bg-gray-700 transition-all border border-gray-600"
            >
              Explore Templates
            </Link>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
            {stats.map((stat, idx) => (
              <div key={idx} className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
                <div className={`text-3xl font-bold ${stat.color} mb-2`}>{stat.value}</div>
                <div className="text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="px-6 py-16 bg-gray-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h2 className="text-3xl font-bold mb-2">Popular Categories</h2>
              <p className="text-gray-400">Explore quizzes by subject</p>
            </div>
            <Link 
              href="/categories" 
              className="text-blue-400 hover:text-blue-300 transition flex items-center gap-2"
            >
              View all →
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {categories.map((cat) => (
              <Link
                key={cat.name}
                href={`/category/${cat.name.toLowerCase()}`}
                className="group bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 text-center border border-gray-700 hover:border-blue-500/50 hover:scale-105 transition-all duration-300"
              >
                <div className={`w-16 h-16 ${cat.color} rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                  {cat.icon}
                </div>
                <div className="font-semibold">{cat.name}</div>
                <div className="text-sm text-gray-400 mt-2">Explore →</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Quizzes Section */}
      <section className="px-6 py-16">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h2 className="text-3xl font-bold mb-2">Your Recent Quizzes</h2>
              <p className="text-gray-400">Pick up where you left off</p>
            </div>
            <div className="flex gap-3">
              <button className="px-4 py-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition">
                Sort by: Recent
              </button>
              <button className="px-4 py-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition">
                Filter
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentQuizzes.map((quiz, idx) => (
              <Link
                key={idx}
                href={`/quiz/${quiz.title.toLowerCase().replace(/\s+/g, '-')}`}
                className="group bg-gray-800/30 backdrop-blur-sm rounded-2xl border border-gray-700 hover:border-blue-500/50 overflow-hidden hover:shadow-2xl transition-all duration-300"
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="inline-block px-3 py-1 bg-gray-700 rounded-full text-sm mb-3">
                        {quiz.category}
                      </div>
                      <h3 className="text-xl font-bold group-hover:text-blue-300 transition">
                        {quiz.title}
                      </h3>
                    </div>
                    <div className="text-2xl">📊</div>
                  </div>
                  
                  <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-700">
                    <div className="flex items-center gap-2 text-gray-400">
                      <div className="w-6 h-6 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full"></div>
                      <span>{quiz.participants} participants</span>
                    </div>
                    <div className="text-gray-400 text-sm">{quiz.edited}</div>
                  </div>
                </div>
                
                <div className="px-6 pb-6">
                  <div className="flex gap-2">
                    <button className="flex-1 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition text-center">
                      Edit
                    </button>
                    <button className="flex-1 py-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg hover:opacity-90 transition text-center">
                      Share
                    </button>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-20 bg-gradient-to-r from-gray-900 via-blue-900/30 to-gray-900">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-br from-blue-900/30 to-purple-900/30 rounded-3xl p-12 border border-gray-700">
            <h2 className="text-4xl font-bold mb-6">Ready to create something amazing?</h2>
            <p className="text-xl text-gray-300 mb-10">
              Join thousands of educators and trainers using QuizMaster to create engaging content.
            </p>
            <Link
              href="/create"
              className="inline-flex items-center gap-3 px-10 py-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white font-bold text-xl rounded-xl hover:shadow-2xl transition-all hover:scale-105"
            >
              <span>🎨 Start Creating Free</span>
              <span>→</span>
            </Link>
            <p className="text-gray-400 mt-6">No credit card required • Free forever plan</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-12 border-t border-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center font-bold text-xl">
                  QZ
                </div>
                <span className="text-2xl font-bold">QuizMaster</span>
              </div>
              <p className="text-gray-400">Making learning interactive and fun for everyone.</p>
            </div>
            
            {["Product", "Resources", "Company", "Connect"].map((section) => (
              <div key={section}>
                <h4 className="font-bold text-lg mb-4">{section}</h4>
                <ul className="space-y-2 text-gray-400">
                  {["Feature 1", "Feature 2", "Feature 3"].map((item) => (
                    <li key={item}>
                      <Link href="#" className="hover:text-white transition">
                        {item}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          
          <div className="mt-12 pt-8 border-t border-gray-800 text-center text-gray-400">
            © 2024 QuizMaster. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}