
import React, { useState } from 'react';
import './PublicWebsite.css';

// SR-PG owner contact and property details.
const OWNER_WHATSAPP = '916309595559';

const pgDetails = {
  name: 'SR-PG',
  owner: 'Sridhar',
  address: 'Honey Heights backside building, opposite HCL, near the airport',
  city: 'Gannavaram',
  accommodationFor: 'Men and Women',
  roomTypes: 'Single and Sharing Rooms',
};

const rooms = [
  {
    id: 1,
    name: 'Single Sharing',
    type: 'Private room',
    rent: 12000,
    available: true,
    image: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=900&q=85',
    features: ['Private space', 'Wi-Fi', 'Wardrobe', 'Attached bathroom'],
  },
  {
    id: 2,
    name: 'Double Sharing',
    type: 'Shared room',
    rent: 8000,
    available: true,
    image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=900&q=85',
    features: ['Two beds', 'Wi-Fi', 'Wardrobe', 'Housekeeping'],
  },
  {
    id: 3,
    name: 'Triple Sharing',
    type: 'Shared room',
    rent: 6000,
    available: false,
    image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=900&q=85',
    features: ['Three beds', 'Wi-Fi', 'Storage', 'Common lounge'],
  },
];

const facilities = [
  ['wifi', 'Wi-Fi', 'Stay connected for work, study, and entertainment.'],
  ['utensils', 'Food & Meals', 'Meal facilities for convenient everyday living.'],
  ['washing-machine', 'Washing Machine', 'Laundry facilities for your daily needs.'],
  ['sparkles', 'Housekeeping', 'Housekeeping support to help keep spaces clean.'],
  ['thermometer', 'Hot Water', 'Hot water for your daily bathing needs.'],
  ['droplet', 'RO Drinking Water', 'RO drinking water for everyday use.'],
  ['zap', 'Power Backup', 'Power backup during electricity interruptions.'],
  ['shield', 'CCTV Security', 'CCTV surveillance for added security.'],
  ['car', 'Parking', 'Parking facility for residents.'],
  ['bath', 'Attached Bathrooms', 'Rooms with attached bathroom facilities.'],
];

const money = (value) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);

function Icon({ name, size = 20 }) {
  const paths = {
    home: (
      <>
        <path d="m3 10 9-7 9 7" />
        <path d="M5 9v12h14V9M9 21v-7h6v7" />
      </>
    ),
    bed: (
      <>
        <path d="M2 4v17M22 4v17M2 17h20M2 10h20M6 10V7h5a3 3 0 0 1 3 3" />
      </>
    ),
    grid: (
      <>
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </>
    ),
    image: (
      <>
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <path d="m21 15-5-5L5 21" />
      </>
    ),
    phone: (
      <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.4 19.4 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7l.5 2.8a2 2 0 0 1-.6 1.8L7.7 9.6a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 1.8-.6l2.8.5a2 2 0 0 1 1.7 2.7Z" />
    ),
    arrow: (
      <>
        <path d="M5 12h14" />
        <path d="m12 5 7 7-7 7" />
      </>
    ),
    check: <path d="m5 12 4 4L19 6" />,
    location: (
      <>
        <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
        <circle cx="12" cy="10" r="2.5" />
      </>
    ),
    menu: <path d="M4 6h16M4 12h16M4 18h16" />,
    close: <path d="m18 6-12 12M6 6l12 12" />,
    wifi: <><path d="M5 12.55a11 11 0 0 1 14.08 0" /><path d="M8.5 16.1a5.5 5.5 0 0 1 7 0" /><path d="M12 20h.01" /><path d="M2 9a16 16 0 0 1 20 0" /></>,
    utensils: <><path d="M3 2v7a4 4 0 0 0 4 4V2" /><path d="M7 2v20" /><path d="M17 2v20" /><path d="M17 2c3 3 4 7 0 10" /></>,
    'washing-machine': <><rect x="4" y="2" width="16" height="20" rx="2" /><circle cx="12" cy="13" r="5" /><path d="M8 5h.01M12 5h.01M16 5h.01" /></>,
    sparkles: <><path d="m12 3 1.9 5.8L20 11l-6.1 2.2L12 19l-1.9-5.8L4 11l6.1-2.2L12 3Z" /><path d="m19 14 1.2 2.8L23 18l-2.8 1.2L19 22l-1.2-2.8L15 18l2.8-1.2L19 14Z" /></>,
    thermometer: <><path d="M14 14.76V5a3 3 0 0 0-6 0v9.76a5 5 0 1 0 6 0Z" /><path d="M11 11v7" /></>,
    droplet: <path d="M12 2.5S5 10 5 14a7 7 0 0 0 14 0c0-4-7-11.5-7-11.5Z" />,
    zap: <path d="m13 2-3 8H5l6 12 3-8h5L13 2Z" />,
    shield: <><path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z" /><path d="m9 12 2 2 4-4" /></>,
    car: <><path d="m5 17-1 3" /><path d="m19 17 1 3" /><path d="M5 17h14l-1-6H6l-1 6Z" /><path d="m6 11 2-5h8l2 5" /><circle cx="7.5" cy="16" r="1" /><circle cx="16.5" cy="16" r="1" /></>,
    bath: <><path d="M9 6V4a2 2 0 0 1 4 0v2" /><path d="M3 12h18v3a5 5 0 0 1-5 5H8a5 5 0 0 1-5-5v-3Z" /><path d="M6 20v2M18 20v2" /></>,
  };

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name] || paths.grid}
    </svg>
  );
}

export default function PublicWebsite() {
  const [page, setPage] = useState('home');
  const [selectedRoom, setSelectedRoom] = useState(rooms[0]);
  const [sharing, setSharing] = useState('All rooms');
  const [mobileMenu, setMobileMenu] = useState(false);
  const [notice, setNotice] = useState('');

  const [enquiry, setEnquiry] = useState({
    name: '',
    phone: '',
    room: '',
    moveIn: '',
    message: '',
  });

  const go = (nextPage) => {
    setPage(nextPage);
    setMobileMenu(false);
    setNotice('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const showRoom = (room) => {
    setSelectedRoom(room);
    setEnquiry((old) => ({ ...old, room: room.name }));
    go('details');
  };

  const visibleRooms = rooms.filter(
    (room) =>
      sharing === 'All rooms' ||
      (sharing === 'Available only' && room.available) ||
      room.name === sharing
  );

  const submitEnquiry = (event) => {
    event.preventDefault();

    if (!/^[1-9]\d{7,14}$/.test(OWNER_WHATSAPP)) {
      setNotice('The SR-PG WhatsApp number is not configured correctly. Please contact the owner directly.');
      return;
    }

    const message = [
      `🏠 *New Room Enquiry — ${pgDetails.name}*`,
      '',
      `👤 Name: ${enquiry.name.trim()}`,
      `📞 Customer phone: ${enquiry.phone.trim()}`,
      `🛏️ Preferred room: ${enquiry.room || 'Not specified'}`,
      `📅 Move-in date: ${enquiry.moveIn || 'Not specified'}`,
      `💬 Message: ${enquiry.message.trim() || 'No additional message'}`,
      '',
      `PG location: ${pgDetails.address}, ${pgDetails.city}`,
    ].join('\n');

    const whatsappUrl = `https://wa.me/${OWNER_WHATSAPP}?text=${encodeURIComponent(message)}`;
    window.location.href = whatsappUrl;
  };

  const navItems = [
    ['home', 'Home'],
    ['rooms', 'Rooms'],
    ['facilities', 'Facilities'],
    ['gallery', 'Gallery'],
    ['contact', 'Contact'],
  ];

  return (
    <div className="srpg">
      <div className="srpg-topline">
        Comfortable stays. Thoughtfully managed.
      </div>

      <header className="srpg-header">
        <button
          className="srpg-brand"
          onClick={() => go('home')}
          aria-label="SR-PG home"
        >
          <span className="srpg-brand-icon">
            <Icon name="home" size={25} />
          </span>
          <span>
            <strong>SR<span>-</span>PG</strong>
            <small>YOUR SPACE. YOUR COMFORT.</small>
          </span>
        </button>

        <button
          className="srpg-menu-button"
          onClick={() => setMobileMenu((open) => !open)}
          aria-label="Toggle navigation"
          aria-expanded={mobileMenu}
        >
          <Icon name={mobileMenu ? 'close' : 'menu'} />
        </button>

        <nav className={`srpg-nav ${mobileMenu ? 'is-open' : ''}`}>
          {navItems.map(([id, label]) => (
            <button
              key={id}
              className={page === id ? 'active' : ''}
              onClick={() => go(id)}
            >
              {label}
            </button>
          ))}
          <button
            className="srpg-nav-cta"
            onClick={() => go('contact')}
          >
            Enquire now
          </button>
        </nav>
      </header>

      <main>
        {page === 'home' && (
          <>
            <section className="srpg-hero">
              <div className="srpg-hero-copy">
                <span className="srpg-eyebrow">WELCOME TO SR-PG</span>
                <h1>
                  A better place
                  <br />
                  to <em>call home.</em>
                </h1>
                <p>
                  Find a comfortable, convenient space designed for your
                  everyday life.
                </p>

                <div className="srpg-hero-actions">
                  <button
                    className="srpg-primary"
                    onClick={() => go('rooms')}
                  >
                    Explore rooms <Icon name="arrow" size={18} />
                  </button>
                  <button
                    className="srpg-text-button"
                    onClick={() => go('contact')}
                  >
                    Get in touch
                  </button>
                </div>

                <div className="srpg-trust-line">
                  <span><Icon name="check" size={16} /> Comfortable rooms</span>
                  <span><Icon name="check" size={16} /> Essential amenities</span>
                </div>
              </div>

              <div className="srpg-hero-image">
                <img
                  src={rooms[0].image}
                  alt="Comfortable furnished accommodation"
                />
                <div className="srpg-image-note">
                  <span className="srpg-note-icon">
                    <Icon name="bed" />
                  </span>
                  <span>
                    <strong>Your next stay starts here</strong>
                    <small>Explore rooms that suit you</small>
                  </span>
                </div>
              </div>
            </section>

            <section className="srpg-section srpg-featured">
              <div className="srpg-section-heading">
                <div>
                  <span className="srpg-eyebrow">FIND YOUR SPACE</span>
                  <h2>Rooms for your lifestyle</h2>
                </div>
                <button
                  className="srpg-link"
                  onClick={() => go('rooms')}
                >
                  View all rooms <Icon name="arrow" size={17} />
                </button>
              </div>

              <RoomGrid rooms={rooms} onSelect={showRoom} />
            </section>

            <section className="srpg-benefits">
              <div>
                <span className="srpg-benefit-icon"><Icon name="home" /></span>
                <strong>Comfortable spaces</strong>
                <p>Designed for a relaxed daily routine.</p>
              </div>
              <div>
                <span className="srpg-benefit-icon"><Icon name="grid" /></span>
                <strong>Essential facilities</strong>
                <p>Everyday conveniences in one place.</p>
              </div>
              <div>
                <span className="srpg-benefit-icon"><Icon name="phone" /></span>
                <strong>Easy enquiries</strong>
                <p>Speak with us about your preferred room.</p>
              </div>
            </section>
          </>
        )}

        {page === 'rooms' && (
          <section className="srpg-section srpg-page-section">
            <PageHeading
              eyebrow="ROOM OPTIONS"
              title="Find your perfect room"
              text="Explore sharing options and choose the space that works for you."
            />

            <div className="srpg-filter-row">
              <label htmlFor="room-filter">Show rooms</label>
              <select
                id="room-filter"
                value={sharing}
                onChange={(event) => setSharing(event.target.value)}
              >
                <option>All rooms</option>
                <option>Available only</option>
                <option>Single Sharing</option>
                <option>Double Sharing</option>
                <option>Triple Sharing</option>
              </select>
            </div>

            <RoomGrid rooms={visibleRooms} onSelect={showRoom} />
          </section>
        )}

        {page === 'details' && (
          <section className="srpg-section srpg-page-section">
            <button className="srpg-back" onClick={() => go('rooms')}>
              ← Back to rooms
            </button>

            <div className="srpg-detail-layout">
              <div>
                <img
                  className="srpg-detail-image"
                  src={selectedRoom.image}
                  alt={selectedRoom.name}
                />
                <div className="srpg-detail-thumb-row">
                  {rooms
                    .filter((room) => room.id !== selectedRoom.id)
                    .map((room) => (
                      <button
                        key={room.id}
                        onClick={() => setSelectedRoom(room)}
                      >
                        <img src={room.image} alt={room.name} />
                      </button>
                    ))}
                </div>
              </div>

              <div className="srpg-detail-copy">
                <span className="srpg-eyebrow">ROOM DETAILS</span>
                <h1>{selectedRoom.name}</h1>
                <p>{selectedRoom.type} accommodation at SR-PG.</p>
                <div className="srpg-detail-price">
                  {money(selectedRoom.rent)} <small>/ month</small>
                </div>

                <span
                  className={`srpg-availability ${
                    selectedRoom.available ? 'available' : 'unavailable'
                  }`}
                >
                  {selectedRoom.available
                    ? '● Available for enquiry'
                    : '● Currently unavailable'}
                </span>

                <h3>Room facilities</h3>
                <ul className="srpg-feature-list">
                  {selectedRoom.features.map((feature) => (
                    <li key={feature}>
                      <Icon name="check" size={17} />
                      {feature}
                    </li>
                  ))}
                </ul>

                <button
                  className="srpg-primary srpg-full"
                  onClick={() => {
                    setEnquiry((old) => ({
                      ...old,
                      room: selectedRoom.name,
                    }));
                    go('contact');
                  }}
                >
                  Enquire about this room <Icon name="arrow" size={18} />
                </button>

                <p className="srpg-small-note">
                  Rent and availability are sample values until confirmed
                  by the owner.
                </p>
              </div>
            </div>
          </section>
        )}

        {page === 'facilities' && (
          <section className="srpg-section srpg-page-section">
            <PageHeading
              eyebrow="THE SR-PG EXPERIENCE"
              title="Everyday comfort, made simple"
              text="Explore the facilities that can make your stay more convenient."
            />

            <div className="srpg-facility-grid">
              {facilities.map(([icon, title, description]) => (
                <article className="srpg-facility-card" key={title}>
                  <span className="srpg-facility-icon">
                    <Icon name={icon} />
                  </span>
                  <h3>{title}</h3>
                  <p>{description}</p>
                </article>
              ))}
            </div>

            <div className="srpg-callout">
              <div>
                <h2>Looking for a room?</h2>
                <p>Tell us what you need and enquire about availability.</p>
              </div>
              <button
                className="srpg-primary"
                onClick={() => go('rooms')}
              >
                Explore rooms <Icon name="arrow" size={18} />
              </button>
            </div>
          </section>
        )}

        {page === 'gallery' && (
          <section className="srpg-section srpg-page-section">
            <PageHeading
              eyebrow="TAKE A LOOK AROUND"
              title="A glimpse of your next stay"
              text="Explore sample accommodation spaces and room styles."
            />

            <div className="srpg-gallery-grid">
              {rooms.map((room, index) => (
                <button
                  key={room.id}
                  onClick={() => showRoom(room)}
                  className={`srpg-gallery-item gallery-${index + 1}`}
                >
                  <img src={room.image} alt={room.name} />
                  <span>
                    {room.name}
                    <small>View room details →</small>
                  </span>
                </button>
              ))}
              <div className="srpg-gallery-message">
                <Icon name="image" size={28} />
                <h3>Your space, your comfort.</h3>
                <p>Actual SR-PG property photos can be added here.</p>
              </div>
            </div>
          </section>
        )}

        {page === 'contact' && (
          <section className="srpg-section srpg-page-section">
            <PageHeading
              eyebrow="LET'S CONNECT"
              title="Make your next move"
              text="Interested in a room? Send an enquiry and the SR-PG team can follow up."
            />

            <div className="srpg-contact-layout">
              <div className="srpg-contact-info">
                <span className="srpg-eyebrow">CONTACT SR-PG</span>
                <h2>We’re here to help.</h2>
                <p>
                  Share your requirements and ask about room availability,
                  rent, or facilities.
                </p>

                <div className="srpg-contact-item">
                  <Icon name="phone" />
                  <div>
                    <strong>Phone / WhatsApp</strong>
                    <small>{pgDetails.owner} · +91 63095 95559</small>
                  </div>
                </div>
                <div className="srpg-contact-item">
                  <Icon name="location" />
                  <div>
                    <strong>Our location</strong>
                    <small>{pgDetails.address}, {pgDetails.city}</small>
                  </div>
                </div>
                <div className="srpg-contact-item">
                  <Icon name="bed" />
                  <div>
                    <strong>Accommodation</strong>
                    <small>{pgDetails.accommodationFor} · {pgDetails.roomTypes}</small>
                  </div>
                </div>
              </div>

              <form className="srpg-enquiry-form" onSubmit={submitEnquiry}>
                <h2>Send an enquiry</h2>
                <p>Fields marked * are required.</p>

                {notice && (
                  <div className="srpg-notice" role="status">
                    {notice}
                  </div>
                )}

                <label>
                  Your name *
                  <input
                    required
                    value={enquiry.name}
                    onChange={(event) =>
                      setEnquiry((old) => ({
                        ...old,
                        name: event.target.value,
                      }))
                    }
                    placeholder="Enter your full name"
                  />
                </label>

                <label>
                  Phone number *
                  <input
                    required
                    type="tel"
                    pattern="[0-9+() -]{8,18}"
                    value={enquiry.phone}
                    onChange={(event) =>
                      setEnquiry((old) => ({
                        ...old,
                        phone: event.target.value,
                      }))
                    }
                    placeholder="Enter your phone number"
                  />
                </label>

                <div className="srpg-form-row">
                  <label>
                    Preferred room
                    <select
                      value={enquiry.room}
                      onChange={(event) =>
                        setEnquiry((old) => ({
                          ...old,
                          room: event.target.value,
                        }))
                      }
                    >
                      <option value="">Choose a room</option>
                      {rooms.map((room) => (
                        <option key={room.id} value={room.name}>
                          {room.name}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label>
                    Move-in date
                    <input
                      type="date"
                      value={enquiry.moveIn}
                      onChange={(event) =>
                        setEnquiry((old) => ({
                          ...old,
                          moveIn: event.target.value,
                        }))
                      }
                    />
                  </label>
                </div>

                <label>
                  Message
                  <textarea
                    rows="3"
                    value={enquiry.message}
                    onChange={(event) =>
                      setEnquiry((old) => ({
                        ...old,
                        message: event.target.value,
                      }))
                    }
                    placeholder="Tell us what you are looking for"
                  />
                </label>

                <button
                  className="srpg-primary srpg-full"
                  type="submit"
                >
                  Submit enquiry <Icon name="arrow" size={18} />
                </button>

                <small className="srpg-small-note">
                  Submitting opens WhatsApp with your enquiry pre-filled. Please press Send in WhatsApp to contact the owner.
                </small>
              </form>
            </div>
          </section>
        )}
      </main>

      <footer className="srpg-footer">
        <div className="srpg-footer-main">
          <button
            className="srpg-brand srpg-footer-brand"
            onClick={() => go('home')}
          >
            <span className="srpg-brand-icon">
              <Icon name="home" size={24} />
            </span>
            <span>
              <strong>SR<span>-</span>PG</strong>
              <small>YOUR SPACE. YOUR COMFORT.</small>
            </span>
          </button>

          <p>
            {pgDetails.name} offers comfortable accommodation for men and women
            near HCL and the airport in {pgDetails.city}.
          </p>

          <button
            className="srpg-footer-contact"
            onClick={() => go('contact')}
          >
            Have a question? Contact us <Icon name="arrow" size={16} />
          </button>
        </div>

        <div className="srpg-footer-links">
          <strong>Explore</strong>
          {navItems.map(([id, label]) => (
            <button key={id} onClick={() => go(id)}>
              {label}
            </button>
          ))}
        </div>
      </footer>

      <div className="srpg-copyright">
        © {new Date().getFullYear()} {pgDetails.name}. All rights reserved.
      </div>
    </div>
  );
}

function PageHeading({ eyebrow, title, text }) {
  return (
    <div className="srpg-page-heading">
      <span className="srpg-eyebrow">{eyebrow}</span>
      <h1>{title}</h1>
      <p>{text}</p>
    </div>
  );
}

function RoomGrid({ rooms: items, onSelect }) {
  return (
    <div className="srpg-room-grid">
      {items.map((room) => (
        <article className="srpg-room-card" key={room.id}>
          <button
            className="srpg-room-image"
            onClick={() => onSelect(room)}
            aria-label={`View ${room.name}`}
          >
            <img
              src={room.image}
              alt={room.name}
              loading="lazy"
            />
            <span
              className={`srpg-availability ${
                room.available ? 'available' : 'unavailable'
              }`}
            >
              {room.available ? 'Available' : 'Unavailable'}
            </span>
          </button>

          <div className="srpg-room-card-body">
            <span className="srpg-room-type">{room.type}</span>
            <h3>{room.name}</h3>

            <div className="srpg-room-card-bottom">
              <div>
                <strong>{money(room.rent)}</strong>
                <small>/ month</small>
              </div>
              <button
                onClick={() => onSelect(room)}
                aria-label={`Details for ${room.name}`}
              >
                <Icon name="arrow" size={19} />
              </button>
            </div>
          </div>
        </article>
      ))}

      {items.length === 0 && <p>No rooms match this filter.</p>}
    </div>
  );
}
