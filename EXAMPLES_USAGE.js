// ============================================
// VÍ DỤ: Cách apply đa ngôn ngữ vào các trang
// ============================================

// 1. LOGIN PAGE EXAMPLE
// File: src/app/login/page.js
"use client";

import { useTranslation } from '@/hooks/useTranslation';

export default function LoginPage() {
    const { t } = useTranslation();

    return (
        <div className="login-container">
            <h1>{t('auth.login')}</h1>
            <form>
                <label>{t('auth.email')}</label>
                <input type="email" placeholder={t('auth.email')} />

                <label>{t('auth.password')}</label>
                <input type="password" placeholder={t('auth.password')} />

                <button type="submit">{t('nav.signIn')}</button>

                <a href="/forgot-password">{t('auth.forgotPassword')}</a>
                <p>
                    {t('auth.noAccount')}
                    <a href="/register">{t('nav.signUp')}</a>
                </p>
            </form>
        </div>
    );
}

// 2. RENTAL POST LIST EXAMPLE
// File: src/app/rental-posts/page.js
"use client";

import { useTranslation } from '@/hooks/useTranslation';

export default function RentalPostsPage() {
    const { t } = useTranslation();

    return (
        <div>
            <h1>{t('rental.title')}</h1>

            <div className="search-bar">
                <input
                    type="text"
                    placeholder={t('home.searchPlaceholder')}
                />
                <button>{t('common.search')}</button>
            </div>

            <div className="rental-card">
                <h3>Phòng cho thuê quận 1</h3>
                <p>{t('rental.price')}: 5,000,000 VND</p>
                <p>{t('rental.location')}: Quận 1, TP.HCM</p>
                <p>{t('rental.area')}: 25 m²</p>
                <button>{t('rental.viewDetails')}</button>
                <button>{t('rental.contactOwner')}</button>
            </div>
        </div>
    );
}

// 3. PROFILE PAGE EXAMPLE
// File: src/app/profile/page.js
"use client";

import { useTranslation } from '@/hooks/useTranslation';

export default function ProfilePage() {
    const { t } = useTranslation();

    return (
        <div>
            <h1>{t('profile.myProfile')}</h1>

            <div className="profile-section">
                <h2>{t('profile.personalInfo')}</h2>

                <div className="form-group">
                    <label>{t('profile.fullName')}</label>
                    <input type="text" />
                </div>

                <div className="form-group">
                    <label>{t('auth.email')}</label>
                    <input type="email" />
                </div>

                <div className="form-group">
                    <label>{t('profile.phone')}</label>
                    <input type="tel" />
                </div>

                <div className="form-group">
                    <label>{t('profile.address')}</label>
                    <textarea />
                </div>

                <div className="actions">
                    <button>{t('common.save')}</button>
                    <button>{t('common.cancel')}</button>
                </div>
            </div>

            <div className="profile-section">
                <h2>{t('profile.changePassword')}</h2>
                <button>{t('profile.changePassword')}</button>
            </div>
        </div>
    );
}

// 4. SEARCH PAGE WITH FILTERS EXAMPLE
// File: src/app/search/page.js
"use client";

import { useTranslation } from '@/hooks/useTranslation';

export default function SearchPage() {
    const { t } = useTranslation();

    return (
        <div>
            <h1>{t('common.search')}</h1>

            <div className="filters">
                <h3>{t('common.filter')}</h3>

                <div>
                    <label>{t('rental.price')}</label>
                    <input type="range" />
                </div>

                <div>
                    <label>{t('rental.location')}</label>
                    <select>
                        <option>{t('home.popularLocations')}</option>
                    </select>
                </div>

                <div>
                    <label>{t('rental.area')}</label>
                    <input type="number" />
                </div>

                <button>{t('common.submit')}</button>
            </div>
        </div>
    );
}

// 5. SUPPORT PAGE EXAMPLE
// File: src/app/support/page.js
"use client";

import { useTranslation } from '@/hooks/useTranslation';

export default function SupportPage() {
    const { t } = useTranslation();

    return (
        <div>
            <h1>{t('support.title')}</h1>

            <div className="support-options">
                <div className="option-card">
                    <h3>{t('support.contactUs')}</h3>
                    <button>{t('support.contactUs')}</button>
                </div>

                <div className="option-card">
                    <h3>{t('support.faq')}</h3>
                    <button>{t('common.view')}</button>
                </div>

                <div className="option-card">
                    <h3>{t('support.helpCenter')}</h3>
                    <button>{t('common.view')}</button>
                </div>
            </div>
        </div>
    );
}

// 6. CUSTOM COMPONENT WITH TRANSLATION
// File: src/components/RentalCard.js
"use client";

import { useTranslation } from '@/hooks/useTranslation';

export default function RentalCard({ rental }) {
    const { t } = useTranslation();

    return (
        <div className="rental-card">
            <img src={rental.image} alt={rental.title} />

            <div className="card-content">
                <h3>{rental.title}</h3>

                <div className="info-row">
                    <span className="label">{t('rental.price')}:</span>
                    <span className="value">{rental.price.toLocaleString()} VND</span>
                </div>

                <div className="info-row">
                    <span className="label">{t('rental.location')}:</span>
                    <span className="value">{rental.location}</span>
                </div>

                <div className="info-row">
                    <span className="label">{t('rental.area')}:</span>
                    <span className="value">{rental.area} m²</span>
                </div>

                <div className="status">
                    {rental.available
                        ? t('rental.available')
                        : t('rental.notAvailable')
                    }
                </div>

                <div className="actions">
                    <button className="btn-primary">
                        {t('rental.viewDetails')}
                    </button>
                    <button className="btn-secondary">
                        {t('rental.contactOwner')}
                    </button>
                </div>
            </div>
        </div>
    );
}

// 7. LOADING STATE EXAMPLE
"use client";

import { useTranslation } from '@/hooks/useTranslation';

export default function LoadingComponent() {
    const { t } = useTranslation();
    const [isLoading, setIsLoading] = useState(false);

    return (
        <div>
            {isLoading ? (
                <div className="loading">
                    <span>{t('common.loading')}</span>
                </div>
            ) : (
                <div>Content here</div>
            )}
        </div>
    );
}

// 8. MODAL EXAMPLE
"use client";

import { useTranslation } from '@/hooks/useTranslation';

export default function ConfirmModal({ onConfirm, onCancel }) {
    const { t } = useTranslation();

    return (
        <div className="modal">
            <div className="modal-content">
                <h3>{t('common.confirm')}</h3>
                <p>Are you sure you want to proceed?</p>

                <div className="modal-actions">
                    <button onClick={onConfirm}>
                        {t('common.confirm')}
                    </button>
                    <button onClick={onCancel}>
                        {t('common.cancel')}
                    </button>
                </div>
            </div>
        </div>
    );
}

// 9. PAGINATION EXAMPLE
"use client";

import { useTranslation } from '@/hooks/useTranslation';

export default function Pagination({ page, totalPages, onPageChange }) {
    const { t } = useTranslation();

    return (
        <div className="pagination">
            <button
                onClick={() => onPageChange(page - 1)}
                disabled={page === 1}
            >
                {t('common.previous')}
            </button>

            <span>Page {page} of {totalPages}</span>

            <button
                onClick={() => onPageChange(page + 1)}
                disabled={page === totalPages}
            >
                {t('common.next')}
            </button>
        </div>
    );
}

// 10. FORM VALIDATION WITH TRANSLATION
"use client";

import { useTranslation } from '@/hooks/useTranslation';

export default function RegisterForm() {
    const { t } = useTranslation();
    const [errors, setErrors] = useState({});

    const validate = (formData) => {
        const newErrors = {};

        if (!formData.email) {
            newErrors.email = `${t('auth.email')} is required`;
        }

        if (!formData.password) {
            newErrors.password = `${t('auth.password')} is required`;
        }

        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = `${t('auth.confirmPassword')} does not match`;
        }

        return newErrors;
    };

    return (
        <form>
            <div>
                <label>{t('auth.email')}</label>
                <input type="email" />
                {errors.email && <span className="error">{errors.email}</span>}
            </div>

            <div>
                <label>{t('auth.password')}</label>
                <input type="password" />
                {errors.password && <span className="error">{errors.password}</span>}
            </div>

            <div>
                <label>{t('auth.confirmPassword')}</label>
                <input type="password" />
                {errors.confirmPassword && <span className="error">{errors.confirmPassword}</span>}
            </div>

            <button type="submit">{t('common.submit')}</button>
        </form>
    );
}
