import React from 'react';
import './Menu.css';

const UserMenu = () => {
    return (
        <div className="menu-container">
            {/* Ana İçerik */}
            <div className="menu-content">
                <h1 className="menu-title">
                    <span className="menu-icon">✨</span> Güvenli Belge Sistemine Hoş Geldiniz! <span className="menu-icon">✨</span>
                </h1>
                <p className="menu-subtitle">
                    Güvenli ve Hızlı Bir Şekilde Belgelerinizi Yönetin . . .


                </p>
                 <p className="menu-subtitle" >
                                   Lütfen yukarıdaki işlemlerden birini seçin .
                                </p>

            </div>
        </div>
    );
};

export default UserMenu;