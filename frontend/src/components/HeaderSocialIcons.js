
const HeaderSocialIcons = ({ business }) => {
  if (!business?.socialLinks) return null;
  
  let socialLinks;
  try {
    socialLinks = JSON.parse(business.socialLinks);
  } catch {
    return null;
  }

  const availableLinks = [
    {
      platform: 'twitter',
      url: socialLinks.twitter,
      title: 'Visit on Twitter',
      icon: 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z'
    },
    {
      platform: 'linkedin',
      url: socialLinks.linkedin,
      title: 'Visit on LinkedIn',
      icon: 'M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z'
    },
     {
      platform: 'facebook',
      url: socialLinks.facebook,
      title: 'Visit on Facebook',
      icon: 'M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-3 7h-1.924c-.615 0-1.076.252-1.076.888v1.112h3l-.238 3h-2.762v8h-3v-8h-2v-3h2v-1.923c0-2.11 1.11-3.077 3.248-3.077h1.752v3z'
    }
  ].filter(link => link.url && link.url.trim() !== '');

  if (availableLinks.length === 0) return null;

  return (
    <div className="flex space-x-2">
      {availableLinks.map(({ platform, url, title, icon }) => (
        <a 
          key={platform}
          href={url.startsWith('http') ? url : `https://${url}`} 
          target="_blank" 
          rel="noopener noreferrer"
          className="w-10 h-10 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center text-gray-600 hover:text-blue-600 hover:bg-white transition-all shadow-sm" 
          title={title}
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d={icon} />
          </svg>
        </a>
      ))}
    </div>
  );
};

export default HeaderSocialIcons;