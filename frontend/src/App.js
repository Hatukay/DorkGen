import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Copy, ExternalLink, Save, Trash2, Eye, EyeOff, Moon, Sun } from 'lucide-react';
import './App.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

function App() {
  const [formData, setFormData] = useState({
    domain: '',
    keywords: [],
    fileTypes: [],
    vulnerability: [],
    cms: [],
    auth: [],
    errors: []
  });

  const [generatedQuery, setGeneratedQuery] = useState('');
  const [generatedURL, setGeneratedURL] = useState('');
  const [savedDorks, setSavedDorks] = useState([]);
  const [categories, setCategories] = useState({});
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    fetchCategories();
    fetchSavedDorks();
    
    // Load dark mode preference from localStorage
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    setDarkMode(savedDarkMode);
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/categories`);
      setCategories(response.data);
    } catch (error) {
      console.error('Kategoriler yüklenemedi:', error);
    }
  };

  const fetchSavedDorks = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/dorks`);
      setSavedDorks(response.data);
    } catch (error) {
      console.error('Kaydedilen dorklar yüklenemedi:', error);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleArrayChange = (field, value, checked) => {
    setFormData(prev => ({
      ...prev,
      [field]: checked
        ? [...prev[field], value]
        : prev[field].filter(item => item !== value)
    }));
  };

  const generateDork = async () => {
    if (!formData.domain.trim()) {
      setMessage('Lütfen bir domain girin');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/api/generate`, formData);
      setGeneratedQuery(response.data.query);
      setGeneratedURL(response.data.url);
      setMessage('Dork sorgusu başarıyla oluşturuldu!');
    } catch (error) {
      setMessage('Dork sorgusu oluşturulamadı: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setMessage('Panoya kopyalandı!');
  };

  const openInGoogle = (url) => {
    window.open(url, '_blank');
  };

  const saveDork = async () => {
    if (!generatedQuery.trim()) {
      setMessage('Önce bir dork sorgusu oluşturun');
      return;
    }

    const name = prompt('Dork için bir isim girin:');
    if (!name) return;

    try {
      await axios.post(`${API_BASE_URL}/api/dorks`, {
        name,
        query: generatedQuery,
        description: `Domain: ${formData.domain}`
      });
      fetchSavedDorks();
      setMessage('Dork başarıyla kaydedildi!');
    } catch (error) {
      setMessage('Dork kaydedilemedi: ' + error.message);
    }
  };

  const deleteDork = async (id) => {
    if (window.confirm('Bu dork\'u silmek istediğinizden emin misiniz?')) {
      try {
        await axios.delete(`${API_BASE_URL}/api/dorks/${id}`);
        fetchSavedDorks();
        setMessage('Dork başarıyla silindi!');
      } catch (error) {
        setMessage('Dork silinemedi: ' + error.message);
      }
    }
  };

  const loadDork = (dork) => {
    setGeneratedQuery(dork.query);
    setGeneratedURL(`https://www.google.com/search?q=${encodeURIComponent(dork.query)}`);
    setMessage('Dork yüklendi!');
  };

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('darkMode', newDarkMode.toString());
  };

  const renderCheckboxGroup = (title, field, options) => (
    <div className="mb-6">
      <h3 className={`text-lg font-semibold mb-3 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>{title}</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {options.map((option) => (
          <label key={option} className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData[field].includes(option)}
              onChange={(e) => handleArrayChange(field, option, e.target.checked)}
              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <span className={`text-sm capitalize ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              {option.replace(/_/g, ' ')}
            </span>
          </label>
        ))}
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen transition-colors duration-200 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Header */}
      <header className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-sm border-b transition-colors duration-200`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>DorkGen</h1>
              <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Google Dork Generator</p>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={toggleDarkMode}
                className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium rounded-md border transition-colors duration-200 ${
                  darkMode 
                    ? 'text-gray-200 bg-gray-700 border-gray-600 hover:bg-gray-600' 
                    : 'text-gray-700 bg-white border-gray-300 hover:bg-gray-50'
                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500`}
              >
                {darkMode ? <Sun size={16} /> : <Moon size={16} />}
                <span>{darkMode ? 'Açık Tema' : 'Karanlık Tema'}</span>
              </button>
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium rounded-md border transition-colors duration-200 ${
                  darkMode 
                    ? 'text-gray-200 bg-gray-700 border-gray-600 hover:bg-gray-600' 
                    : 'text-gray-700 bg-white border-gray-300 hover:bg-gray-50'
                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500`}
              >
                {showAdvanced ? <EyeOff size={16} /> : <Eye size={16} />}
                <span>{showAdvanced ? 'Basit' : 'Gelişmiş'}</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form Section */}
          <div className="lg:col-span-2">
            <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg shadow-sm border p-6 transition-colors duration-200`}>
              <h2 className={`text-xl font-semibold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Dork Parametreleri</h2>
              
              {/* Domain Input */}
              <div className="mb-6">
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                  Hedef Domain
                </label>
                <input
                  type="text"
                  value={formData.domain}
                  onChange={(e) => handleInputChange('domain', e.target.value)}
                  placeholder="example.com"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors duration-200 ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                />
              </div>

              {/* Keywords Input */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Anahtar Kelimeler
                </label>
                <input
                  type="text"
                  value={formData.keywords.join(', ')}
                  onChange={(e) => handleInputChange('keywords', e.target.value.split(',').map(k => k.trim()).filter(k => k))}
                  placeholder="admin, config, backup, password"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">Virgülle ayırarak birden fazla kelime ekleyin</p>
              </div>

              {showAdvanced && (
                <>
                  {renderCheckboxGroup('Dosya Türleri', 'fileTypes', categories.fileTypes || [])}
                  {renderCheckboxGroup('Zafiyet Tespiti', 'vulnerability', categories.vulnerability || [])}
                  {renderCheckboxGroup('CMS ve Framework', 'cms', categories.cms || [])}
                  {renderCheckboxGroup('Kimlik Doğrulama', 'auth', categories.auth || [])}
                  {renderCheckboxGroup('Hata ve Bilgi Sızıntıları', 'errors', categories.errors || [])}
                </>
              )}

              {/* Generate Button */}
              <button
                onClick={generateDork}
                disabled={loading || !formData.domain.trim()}
                className="w-full bg-primary-600 text-white py-3 px-4 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                <Search size={20} />
                <span>{loading ? 'Oluşturuluyor...' : 'Dork Oluştur'}</span>
              </button>
            </div>
          </div>

          {/* Results Section */}
          <div className="lg:col-span-1">
            <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg shadow-sm border p-6 transition-colors duration-200`}>
              <h2 className={`text-xl font-semibold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Sonuçlar</h2>
              
              {generatedQuery && (
                <>
                  <div className="mb-4">
                    <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                      Oluşturulan Sorgu
                    </label>
                    <div className="relative">
                      <textarea
                        value={generatedQuery}
                        readOnly
                        className={`w-full h-24 px-3 py-2 border rounded-md font-mono text-sm resize-none transition-colors duration-200 ${
                          darkMode 
                            ? 'bg-gray-700 border-gray-600 text-gray-200' 
                            : 'bg-gray-50 border-gray-300 text-gray-900'
                        }`}
                      />
                      <button
                        onClick={() => copyToClipboard(generatedQuery)}
                        className={`absolute top-2 right-2 p-1 transition-colors duration-200 ${
                          darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'
                        }`}
                        title="Kopyala"
                      >
                        <Copy size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <button
                      onClick={() => openInGoogle(generatedURL)}
                      className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 flex items-center justify-center space-x-2"
                    >
                      <ExternalLink size={16} />
                      <span>Google'da Ara</span>
                    </button>
                    
                    <button
                      onClick={saveDork}
                      className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center justify-center space-x-2"
                    >
                      <Save size={16} />
                      <span>Kaydet</span>
                    </button>
                  </div>
                </>
              )}

              {!generatedQuery && (
                <div className={`text-center py-8 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  <Search size={48} className={`mx-auto mb-4 ${darkMode ? 'text-gray-600' : 'text-gray-300'}`} />
                  <p>Dork parametrelerini seçin ve "Dork Oluştur" butonuna tıklayın</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Saved Dorks Section */}
        {savedDorks.length > 0 && (
          <div className="mt-8">
            <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg shadow-sm border p-6 transition-colors duration-200`}>
              <h2 className={`text-xl font-semibold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Kaydedilen Dorklar</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {savedDorks.map((dork) => (
                  <div key={dork.id} className={`border rounded-lg p-4 hover:shadow-md transition-all duration-200 ${
                    darkMode ? 'border-gray-600 hover:border-gray-500' : 'border-gray-200 hover:border-gray-300'
                  }`}>
                    <div className="flex justify-between items-start mb-2">
                      <h3 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{dork.name}</h3>
                      <button
                        onClick={() => deleteDork(dork.id)}
                        className="text-red-500 hover:text-red-700 p-1 transition-colors duration-200"
                        title="Sil"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <p className={`text-sm mb-3 line-clamp-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{dork.description}</p>
                    <div className="space-y-2">
                      <button
                        onClick={() => loadDork(dork)}
                        className={`w-full py-2 px-3 rounded-md text-sm transition-colors duration-200 ${
                          darkMode 
                            ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' 
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        Yükle
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Message */}
        {message && (
          <div className={`fixed bottom-4 right-4 border rounded-lg shadow-lg p-4 max-w-sm transition-colors duration-200 ${
            darkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'
          }`}>
            <p className={darkMode ? 'text-gray-200' : 'text-gray-800'}>{message}</p>
            <button
              onClick={() => setMessage('')}
              className={`absolute top-2 right-2 transition-colors duration-200 ${
                darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              ×
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
