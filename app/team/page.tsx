export default function TeamPage() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Nossa Equipe</h1>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <p className="text-gray-700 dark:text-gray-300 mb-6">
          Conheça os profissionais talentosos que trabalham para tornar o Agente AI Canvas uma realidade.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center">
            <div className="w-24 h-24 bg-gray-200 dark:bg-gray-600 rounded-full mx-auto mb-4"></div>
            <h3 className="font-semibold text-lg">Ana Silva</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Desenvolvedora Frontend</p>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center">
            <div className="w-24 h-24 bg-gray-200 dark:bg-gray-600 rounded-full mx-auto mb-4"></div>
            <h3 className="font-semibold text-lg">Carlos Oliveira</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Engenheiro de IA</p>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center">
            <div className="w-24 h-24 bg-gray-200 dark:bg-gray-600 rounded-full mx-auto mb-4"></div>
            <h3 className="font-semibold text-lg">Mariana Costa</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">UX Designer</p>
          </div>
        </div>
      </div>
    </div>
  )
}
