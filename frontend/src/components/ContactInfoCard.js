import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Skeleton from "react-loading-skeleton";

const ContactInfoCard = ({
  business,
  editing,
  formData,
  handleInputChange,
  saveField,
  toggleEdit,
  isReadOnly,
  loading,
  onSaveContact,
}) => {
  const { contact: isEditingContact, location: isEditingLocation, businessHours: isEditingHours } = editing;
  const [socialLinks, setSocialLinks] = useState([]);
  
  useEffect(() => {
    if (formData.socialLinks) {
      try {
        const links = JSON.parse(formData.socialLinks);
        setSocialLinks(Object.entries(links).filter(([_, url]) => url).map(([platform, url]) => ({ platform, url })));
      } catch {
        setSocialLinks([]);
      }
    }
  }, [formData.socialLinks]);

  const addSocialLink = () => {
    setSocialLinks([...socialLinks, { platform: '', url: '' }]);
  };

  const updateSocialLink = (index, field, value) => {
    const updated = [...socialLinks];
    updated[index][field] = value;
    setSocialLinks(updated);
    
    const linksObj = {};
    updated.forEach(link => {
      if (link.platform && link.url) {
        linksObj[link.platform] = link.url;
      }
    });
    handleInputChange('socialLinks', JSON.stringify(linksObj));
  };

  const removeSocialLink = (index) => {
    const updated = socialLinks.filter((_, i) => i !== index);
    setSocialLinks(updated);
    
    const linksObj = {};
    updated.forEach(link => {
      if (link.platform && link.url) {
        linksObj[link.platform] = link.url;
      }
    });
    handleInputChange('socialLinks', JSON.stringify(linksObj));
  };
  
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <Skeleton height={28} width={200} className="mb-4" />
        <Skeleton count={3} height={20} className="mb-2" />
        <Skeleton height={150} className="mt-4 mb-4" />
        <Skeleton height={28} width={150} className="mb-4" />
        <Skeleton count={4} height={20} className="mb-2" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Contact Information */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-900">Contact</h3>
          {!isEditingContact && (
            <button
              onClick={() => isReadOnly ? toast.error('Upgrade to edit contact info') : toggleEdit('contact')}
              className={`p-2 rounded-lg ${isReadOnly ? 'text-gray-300 cursor-not-allowed' : 'text-gray-400 hover:text-blue-600 hover:bg-blue-50'}`}
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
              </svg>
            </button>
          )}
        </div>

        {isEditingContact ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                placeholder="contact@business.com"
                value={formData.contactEmail}
                onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input
                type="tel"
                placeholder="+1 (555) 123-4567"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
              <input
                type="url"
                placeholder="https://www.business.com"
                value={formData.website}
                onChange={(e) => handleInputChange('website', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            {/* Social Links */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">Social Links</label>
                <button
                  onClick={addSocialLink}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  + Add Link
                </button>
              </div>
              <div className="space-y-2">
                {socialLinks.map((link, index) => (
                  <div key={index} className="flex space-x-2">
                    <select
                      value={link.platform}
                      onChange={(e) => updateSocialLink(index, 'platform', e.target.value)}
                      className="w-1/3 p-2 border border-gray-300 rounded-lg text-sm"
                    >
                      <option value="">Platform</option>
                      <option value="facebook">Facebook</option>
                      <option value="twitter">Twitter</option>
                      <option value="linkedin">LinkedIn</option>
                      <option value="instagram">Instagram</option>
                      <option value="youtube">YouTube</option>
                    </select>
                    <input
                      type="url"
                      placeholder="https://..."
                      value={link.url}
                      onChange={(e) => updateSocialLink(index, 'url', e.target.value)}
                      className="flex-1 p-2 border border-gray-300 rounded-lg text-sm"
                    />
                    <button
                      onClick={() => removeSocialLink(index)}
                      className="p-2 text-red-600 hover:text-red-700"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex space-x-2 pt-4 border-t">
              <button
                onClick={onSaveContact}
                disabled={isReadOnly}
                className={`px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors ${isReadOnly ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                Save Changes
              </button>
              <button onClick={() => toggleEdit('contact')} className="px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors">
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {business?.contactEmail && (
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20"><path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" /><path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" /></svg>
                </div>
                <span className="text-gray-700">{business.contactEmail}</span>
              </div>
            )}
            {business?.phone && (
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20"><path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" /></svg>
                </div>
                <span className="text-gray-700">{business.phone}</span>
              </div>
            )}
            {business?.website && (
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-purple-600" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" /></svg>
                </div>
                <a href={business.website.startsWith('http') ? business.website : `https://${business.website}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  {business.website}
                </a>
              </div>
            )}
            {socialLinks.length > 0 && (
              <div className="pt-2 border-t">
                <div className="flex flex-wrap gap-2">
                  {socialLinks.map((link, index) => (
                    <a
                      key={index}
                      href={link.url.startsWith('http') ? link.url : `https://${link.url}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-1 px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-sm text-gray-700 transition-colors"
                    >
                      <span className="capitalize">{link.platform}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}
            {(!business?.contactEmail && !business?.phone && !business?.website) && (
              <div className="text-gray-400 italic text-center py-8">No contact info set</div>
            )}
          </div>
        )}
      </div>

      {/* Location */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-900">Location</h3>
          {!isEditingLocation && (
            <button
              onClick={() => isReadOnly ? toast.error('Upgrade to edit location') : toggleEdit('location')}
              className={`p-2 rounded-lg ${isReadOnly ? 'text-gray-300 cursor-not-allowed' : 'text-gray-400 hover:text-blue-600 hover:bg-blue-50'}`}
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" /></svg>
            </button>
          )}
        </div>
        
        {/* Interactive Map */}
        <div className="h-48 rounded-lg mb-4 border border-gray-200 overflow-hidden">
          {business?.address || business?.city ? (
            process.env.REACT_APP_GOOGLE_MAPS_API_KEY ? (
              <iframe
                src={`https://www.google.com/maps/embed/v1/place?key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}&q=${encodeURIComponent(
                  [business?.address, business?.city, business?.state, business?.country]
                    .filter(Boolean)
                    .join(', ')
                )}`}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="w-full h-full"
              />
            ) : (
              <div className="h-full bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center cursor-pointer"
                onClick={() => {
                  const address = [business?.address, business?.city, business?.state, business?.country]
                    .filter(Boolean)
                    .join(', ');
                  window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`, '_blank');
                }}
              >
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-2">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <p className="text-sm text-gray-600 font-medium">View on Google Maps</p>
                  <p className="text-xs text-gray-500">Click to open in new tab</p>
                </div>
              </div>
            )
          ) : (
            <div className="h-full bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-2">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <p className="text-sm text-gray-600">Add location to show map</p>
                <p className="text-xs text-gray-500">Enter address to display interactive map</p>
              </div>
            </div>
          )}
        </div>

        {isEditingLocation ? (
          <div className="space-y-3">
            <input type="text" placeholder="Street Address" value={formData.address} onChange={(e) => handleInputChange('address', e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
            <div className="grid grid-cols-2 gap-3">
              <input type="text" placeholder="City" value={formData.city} onChange={(e) => handleInputChange('city', e.target.value)} className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
              <input type="text" placeholder="State" value={formData.state} onChange={(e) => handleInputChange('state', e.target.value)} className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <input type="text" placeholder="Country" value={formData.country} onChange={(e) => handleInputChange('country', e.target.value)} className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
              <input type="text" placeholder="Postal Code" value={formData.postalCode} onChange={(e) => handleInputChange('postalCode', e.target.value)} className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
            </div>
            <div className="flex space-x-2 pt-4 border-t">
              <button
                onClick={onSaveContact}
                disabled={isReadOnly}
                className={`px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors ${isReadOnly ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                Save Changes
              </button>
              <button onClick={() => toggleEdit('location')} className="px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors">
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {business?.address && (
              <div className="flex items-start space-x-3">
                <div className="w-5 h-5 text-gray-400 mt-0.5">
                  <svg fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" /></svg>
                </div>
                <div className="text-gray-700">
                  <div>{business.address}</div>
                  <div>{[business?.city, business?.state, business?.country].filter(Boolean).join(', ')}</div>
                  {business?.postalCode && <div>{business.postalCode}</div>}
                </div>
              </div>
            )}
            {(!business?.address && !business?.city) && (
              <div className="text-gray-400 italic text-center py-4">No location set</div>
            )}
          </div>
        )}
      </div>

      {/* Business Hours */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-900">Hours</h3>
          {!isEditingHours && (
            <button
              onClick={() => isReadOnly ? toast.error('Upgrade to edit business hours') : toggleEdit('businessHours')}
              className={`p-2 rounded-lg ${isReadOnly ? 'text-gray-300 cursor-not-allowed' : 'text-gray-400 hover:text-blue-600 hover:bg-blue-50'}`}
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" /></svg>
            </button>
          )}
        </div>
        {isEditingHours ? (
          <div className="space-y-3">
            {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map(day => {
              const hours = (() => {
                try { return formData.businessHours ? JSON.parse(formData.businessHours) : {}; } catch { return {}; }
              })();
              return (
                <div key={day} className="flex items-center space-x-3">
                  <span className="w-24 text-sm capitalize font-medium text-gray-700">{day}:</span>
                  <input
                    type="text"
                    placeholder="9:00 AM - 5:00 PM or Closed"
                    value={hours[day] || ''}
                    onChange={(e) => {
                      try {
                        const currentHours = formData.businessHours ? JSON.parse(formData.businessHours) : {};
                        currentHours[day] = e.target.value;
                        handleInputChange('businessHours', JSON.stringify(currentHours));
                      } catch {
                        const newHours = {}; newHours[day] = e.target.value;
                        handleInputChange('businessHours', JSON.stringify(newHours));
                      }
                    }}
                    className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              );
            })}
            <div className="flex space-x-2 pt-4 border-t">
              <button
                onClick={() => isReadOnly ? null : saveField('businessHours')}
                disabled={isReadOnly}
                className={`px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors ${isReadOnly ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                Save Changes
              </button>
              <button onClick={() => toggleEdit('businessHours')} className="px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors">
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {(() => {
              let hours = {};
              if (business?.businessHours) {
                try {
                  hours = typeof business.businessHours === 'string' ? JSON.parse(business.businessHours) : business.businessHours;
                } catch {
                  hours = {};
                }
              }
              const hasHours = Object.values(hours).some(hour => hour);
              return hasHours ? (
                Object.entries(hours).map(([day, time]) => (
                  time && (
                    <div key={day} className="flex justify-between items-center py-1">
                      <span className="capitalize font-medium text-gray-700">{day}</span>
                      <span className="text-gray-600">{time}</span>
                    </div>
                  )
                ))
              ) : (
                <div className="text-gray-400 italic text-center py-4">No hours set</div>
              );
            })()}
          </div>
        )}
      </div>
    </div>
  );
};

export default ContactInfoCard;