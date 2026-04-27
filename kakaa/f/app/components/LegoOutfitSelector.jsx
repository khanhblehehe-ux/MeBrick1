"use client";

import { useState } from "react";
import {
  FiX,
  FiArrowLeft,
  FiArrowRight,
  FiCheck,
  FiUser,
  FiSmile,
  FiStar
} from "react-icons/fi";

const LEGO_CONFIG = {
  baseParts: {
    head: "/images/lego/body/head_base.png",
    torso: "/images/lego/body/torso_base.png",
    legs: "/images/lego/body/legs_base.png"
  },
  
  outfits: [
    {
      id: "outfit-vest-den",
      name: "Vest Đen",
      src: "/images/lego/outfits/vest-den.png",
      thumbnail: "/images/lego/outfits/vest-den.png",
      price: 10000,
      tags: ["vest", "formal", "đen"]
    },
    {
      id: "outfit-graduation",
      name: "Áo vest tốt nghiệp",
      src: "/images/lego/outfits/graduation.png",
      thumbnail: "/images/lego/outfits/graduation.png",
      price: 10000,
      tags: ["graduation", "tốt nghiệp", "vest"]
    },
    {
      id: "outfit-wedding-dress",
      name: "Váy cưới trắng",
      src: "/images/lego/outfits/wedding_dress.png",
      thumbnail: "/images/lego/outfits/wedding_dress.png",
      price: 10000,
      tags: ["wedding", "cưới", "váy"]
    },
    {
      id: "outfit-cowboy-male",
      name: "Cao bồi nam",
      src: "/images/lego/outfits/cowboy_male.png",
      thumbnail: "/images/lego/outfits/cowboy_male.png",
      price: 10000,
      tags: ["cowboy", "cao bồi", "nam"]
    },
    {
      id: "outfit-cowboy-female",
      name: "Cao bồi nữ",
      src: "/images/lego/outfits/cowboy_female.png",
      thumbnail: "/images/lego/outfits/cowboy_female.png",
      price: 10000,
      tags: ["cowboy", "cao bồi", "nữ"]
    },
    {
      id: "outfit-doctor",
      name: "Bác sĩ",
      src: "/images/lego/outfits/doctor.png",
      thumbnail: "/images/lego/outfits/doctor.png",
      price: 10000,
      tags: ["doctor", "bác sĩ"]
    },
    
  ],
  
  faces: [
    {
      id: "face-happy",
      name: "Mặt Vui",
      src: "/images/lego/faces/happy.png",
      thumbnail: "/images/lego/faces/happy.png",
      price: 0
    },
    {
      id: "face-smile",
      name: "Mặt Cười",
      src: "/images/lego/faces/smile.png",
      thumbnail: "/images/lego/faces/smile.png",
      price: 0
    },
    {
      id: "face-neutral",
      name: "Mặt Bình thường",
      src: "/images/lego/faces/neutral.png",
      thumbnail: "/images/lego/faces/neutral.png",
      price: 0
    },
    {
      id: "face-wink",
      name: "Mặt Nháy mắt",
      src: "/images/lego/faces/wink.png",
      thumbnail: "/images/lego/faces/wink.png",
      price: 0
    }
  ],
  
  hairs: [
    {
      id: "hair-short",
      name: "Tóc Ngắn",
      src: "/images/lego/hairs/short.png",
      thumbnail: "/images/lego/hairs/short.png",
      price: 0
    },
    {
      id: "hair-long",
      name: "Tóc Dài",
      src: "/images/lego/hairs/long.png",
      thumbnail: "/images/lego/hairs/long.png",
      price: 0
    },
    {
      id: "hair-curly",
      name: "Tóc Xoăn",
      src: "/images/lego/hairs/curly.png",
      thumbnail: "/images/lego/hairs/curly.png",
      price: 0
    },
    {
      id: "hair-spiky",
      name: "Tóc Dựng",
      src: "/images/lego/hairs/spiky.png",
      thumbnail: "/images/lego/hairs/spiky.png",
      price: 0
    }
  ]
};

export default function LegoOutfitSelector({ onConfirm, onClose }) {
  const [step, setStep] = useState(1);
  const [selectedOutfit, setSelectedOutfit] = useState(null);
  const [selectedFace, setSelectedFace] = useState(null);
  const [selectedHair, setSelectedHair] = useState(null);

  const handleFinish = () => {
    if (!selectedOutfit || !selectedFace || !selectedHair) {
      alert("Vui lòng chọn đầy đủ trang phục, khuôn mặt và kiểu tóc!");
      return;
    }

    // Tạo đối tượng character hoàn chỉnh
    const character = {
      id: `lego-character-${Date.now()}`,
      type: "lego",
      name: "Nhân vật LEGO",
      category: "character",
      x: 150,
      y: 150,
      width: 160,
      height: 300,
      rotation: 0,
      price: selectedOutfit.price,
      layerType: "character",
      
      // Các layer cấu thành
      layers: {
        head: LEGO_CONFIG.baseParts.head,
        torso: LEGO_CONFIG.baseParts.torso,
        legs: LEGO_CONFIG.baseParts.legs,
        outfit: selectedOutfit.src,
        face: selectedFace.src,
        hair: selectedHair.src
      },
      
      // Thông tin đã chọn
      selected: {
        outfit: selectedOutfit,
        face: selectedFace,
        hair: selectedHair
      }
    };

    onConfirm(character);
  };

  const renderStepIndicator = () => (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      gap: '10px',
      marginBottom: '30px'
    }}>
      {[1, 2, 3].map((num) => (
        <div key={num} style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <div style={{
            width: '30px',
            height: '30px',
            borderRadius: '50%',
            backgroundColor: step >= num ? '#007bff' : '#e0e0e0',
            color: step >= num ? 'white' : '#666',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: '600',
            fontSize: '14px'
          }}>
            {num}
          </div>
          {num < 3 && (
            <div style={{
              width: '40px',
              height: '2px',
              backgroundColor: step > num ? '#007bff' : '#e0e0e0'
            }} />
          )}
        </div>
      ))}
      <div style={{
        fontSize: '14px',
        color: '#007bff',
        fontWeight: '600',
        marginLeft: '20px'
      }}>
        {step === 1 && 'Chọn trang phục'}
        {step === 2 && 'Chọn khuôn mặt'}
        {step === 3 && 'Chọn kiểu tóc'}
      </div>
    </div>
  );

  const renderOutfitSelection = () => (
    <div>
      <h3 style={{
        fontSize: '18px',
        fontWeight: '600',
        marginBottom: '15px',
        color: '#333',
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
      }}>
        <FiUser /> Chọn trang phục
      </h3>
      <p style={{ color: '#666', marginBottom: '20px', fontSize: '14px' }}>
        Chọn một trong các trang phục có sẵn. Mỗi trang phục có giá 10,000đ.
      </p>
      
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
        gap: '15px',
        maxHeight: '300px',
        overflowY: 'auto',
        padding: '10px'
      }}>
        {LEGO_CONFIG.outfits.map((outfit) => (
          <div
            key={outfit.id}
            onClick={() => setSelectedOutfit(outfit)}
            style={{
              cursor: 'pointer',
              padding: '15px',
              borderRadius: '10px',
              border: selectedOutfit?.id === outfit.id 
                ? '2px solid #007bff' 
                : '1px solid #e0e0e0',
              backgroundColor: selectedOutfit?.id === outfit.id 
                ? '#f0f8ff' 
                : 'white',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '10px',
              transition: 'all 0.2s',
              position: 'relative'
            }}
          >
            {selectedOutfit?.id === outfit.id && (
              <div style={{
                position: 'absolute',
                top: '-8px',
                right: '-8px',
                width: '24px',
                height: '24px',
                backgroundColor: '#007bff',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '12px'
              }}>
                <FiCheck />
              </div>
            )}
            
            <img
              src={outfit.thumbnail}
              alt={outfit.name}
              style={{
                width: '80px',
                height: '100px',
                objectFit: 'contain'
              }}
            />
            
            <div style={{
              fontSize: '12px',
              textAlign: 'center',
              fontWeight: selectedOutfit?.id === outfit.id ? '600' : '500',
              color: selectedOutfit?.id === outfit.id ? '#007bff' : '#333'
            }}>
              {outfit.name}
            </div>
            
            <div style={{
              fontSize: '11px',
              color: '#ff6b00',
              fontWeight: '600',
              backgroundColor: '#fff3e0',
              padding: '4px 8px',
              borderRadius: '4px'
            }}>
              {outfit.price.toLocaleString('vi-VN')}đ
            </div>
            
            {outfit.tags && (
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '4px',
                justifyContent: 'center',
                marginTop: '5px'
              }}>
                {outfit.tags.slice(0, 2).map((tag, index) => (
                  <span
                    key={index}
                    style={{
                      fontSize: '9px',
                      color: '#666',
                      backgroundColor: '#f5f5f5',
                      padding: '2px 6px',
                      borderRadius: '10px'
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const renderFaceSelection = () => (
    <div>
      <h3 style={{
        fontSize: '18px',
        fontWeight: '600',
        marginBottom: '15px',
        color: '#333',
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
      }}>
        <FiSmile /> Chọn khuôn mặt
      </h3>
      <p style={{ color: '#666', marginBottom: '20px', fontSize: '14px' }}>
        Chọn biểu cảm cho nhân vật LEGO của bạn. Tất cả khuôn mặt đều miễn phí.
      </p>
      
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
        gap: '15px',
        maxHeight: '250px',
        overflowY: 'auto',
        padding: '10px'
      }}>
        {LEGO_CONFIG.faces.map((face) => (
          <div
            key={face.id}
            onClick={() => setSelectedFace(face)}
            style={{
              cursor: 'pointer',
              padding: '15px',
              borderRadius: '10px',
              border: selectedFace?.id === face.id 
                ? '2px solid #007bff' 
                : '1px solid #e0e0e0',
              backgroundColor: selectedFace?.id === face.id 
                ? '#f0f8ff' 
                : 'white',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '10px',
              transition: 'all 0.2s'
            }}
          >
            {selectedFace?.id === face.id && (
              <div style={{
                position: 'absolute',
                top: '-8px',
                right: '-8px',
                width: '24px',
                height: '24px',
                backgroundColor: '#007bff',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '12px'
              }}>
                <FiCheck />
              </div>
            )}
            
            <img
              src={face.thumbnail}
              alt={face.name}
              style={{
                width: '60px',
                height: '60px',
                objectFit: 'contain'
              }}
            />
            
            <div style={{
              fontSize: '12px',
              textAlign: 'center',
              fontWeight: selectedFace?.id === face.id ? '600' : '500',
              color: selectedFace?.id === face.id ? '#007bff' : '#333'
            }}>
              {face.name}
            </div>
            
            <div style={{
              fontSize: '11px',
              color: '#28a745',
              fontWeight: '600'
            }}>
              Miễn phí
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderHairSelection = () => (
    <div>
      <h3 style={{
        fontSize: '18px',
        fontWeight: '600',
        marginBottom: '15px',
        color: '#333',
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
      }}>
        <FiStar /> Chọn kiểu tóc
      </h3>
      <p style={{ color: '#666', marginBottom: '20px', fontSize: '14px' }}>
        Chọn kiểu tóc yêu thích cho nhân vật. Tất cả kiểu tóc đều miễn phí.
      </p>
      
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
        gap: '15px',
        maxHeight: '250px',
        overflowY: 'auto',
        padding: '10px'
      }}>
        {LEGO_CONFIG.hairs.map((hair) => (
          <div
            key={hair.id}
            onClick={() => setSelectedHair(hair)}
            style={{
              cursor: 'pointer',
              padding: '15px',
              borderRadius: '10px',
              border: selectedHair?.id === hair.id 
                ? '2px solid #007bff' 
                : '1px solid #e0e0e0',
              backgroundColor: selectedHair?.id === hair.id 
                ? '#f0f8ff' 
                : 'white',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '10px',
              transition: 'all 0.2s'
            }}
          >
            {selectedHair?.id === hair.id && (
              <div style={{
                position: 'absolute',
                top: '-8px',
                right: '-8px',
                width: '24px',
                height: '24px',
                backgroundColor: '#007bff',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '12px'
              }}>
                <FiCheck />
              </div>
            )}
            
            <img
              src={hair.thumbnail}
              alt={hair.name}
              style={{
                width: '60px',
                height: '60px',
                objectFit: 'contain'
              }}
            />
            
            <div style={{
              fontSize: '12px',
              textAlign: 'center',
              fontWeight: selectedHair?.id === hair.id ? '600' : '500',
              color: selectedHair?.id === hair.id ? '#007bff' : '#333'
            }}>
              {hair.name}
            </div>
            
            <div style={{
              fontSize: '11px',
              color: '#28a745',
              fontWeight: '600'
            }}>
              Miễn phí
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderPreview = () => (
    <div style={{
      backgroundColor: '#f8f9fa',
      borderRadius: '12px',
      padding: '20px',
      marginBottom: '20px'
    }}>
      <h4 style={{
        fontSize: '16px',
        fontWeight: '600',
        marginBottom: '15px',
        color: '#333',
        textAlign: 'center'
      }}>
        Xem trước
      </h4>
      
      <div style={{
        position: 'relative',
        width: '160px',
        height: '300px',
        margin: '0 auto',
        backgroundColor: '#fff',
        borderRadius: '8px',
        border: '1px solid #ddd',
        overflow: 'hidden'
      }}>
        {/* LEGO Character Preview */}
        <div style={{
          position: 'absolute',
          width: '100%',
          height: '100%'
        }}>
          {/* Legs */}
          <img
            src={LEGO_CONFIG.baseParts.legs}
            alt="Legs"
            style={{
              position: 'absolute',
              width: '140px',
              left: '10px',
              top: '192px',
              height: '100px',
              zIndex: 9
            }}
          />
          
          {/* Torso */}
          <img
            src={LEGO_CONFIG.baseParts.torso}
            alt="Torso"
            style={{
              position: 'absolute',
              width: '160px',
              left: '0',
              top: '70px',
              height: '120px',
              zIndex: 10
            }}
          />
          
          {/* Outfit */}
          {selectedOutfit && (
            <img
              src={selectedOutfit.src}
              alt="Outfit"
              style={{
                position: 'absolute',
                width: '160px',
                left: '0',
                top: '70px',
                height: '120px',
                zIndex: 11
              }}
            />
          )}
          
          {/* Head */}
          <img
            src={LEGO_CONFIG.baseParts.head}
            alt="Head"
            style={{
              position: 'absolute',
              width: '150px',
              left: '5px',
              top: '0',
              height: '100px',
              zIndex: 12
            }}
          />
          
          {/* Face */}
          {selectedFace && (
            <img
              src={selectedFace.src}
              alt="Face"
              style={{
                position: 'absolute',
                width: '120px',
                left: '20px',
                top: '10px',
                height: '80px',
                zIndex: 13
              }}
            />
          )}
          
          {/* Hair */}
          {selectedHair && (
            <img
              src={selectedHair.src}
              alt="Hair"
              style={{
                position: 'absolute',
                width: '120px',
                left: '20px',
                top: '10px',
                height: '80px',
                zIndex: 14
              }}
            />
          )}
        </div>
      </div>
      
      {/* Selection Summary */}
      <div style={{
        marginTop: '15px',
        fontSize: '13px',
        color: '#666'
      }}>
        <div style={{ marginBottom: '5px' }}>
          <strong>Trang phục:</strong> {selectedOutfit ? selectedOutfit.name : 'Chưa chọn'}
        </div>
        <div style={{ marginBottom: '5px' }}>
          <strong>Khuôn mặt:</strong> {selectedFace ? selectedFace.name : 'Chưa chọn'}
        </div>
        <div>
          <strong>Kiểu tóc:</strong> {selectedHair ? selectedHair.name : 'Chưa chọn'}
        </div>
      </div>
      
      <div style={{
        marginTop: '10px',
        padding: '8px',
        backgroundColor: selectedOutfit ? '#fff3e0' : '#f5f5f5',
        borderRadius: '6px',
        textAlign: 'center',
        fontSize: '12px'
      }}>
        <strong>Tổng giá:</strong> {selectedOutfit ? selectedOutfit.price.toLocaleString('vi-VN') + 'đ' : '0đ'}
      </div>
    </div>
  );

  const renderNavigationButtons = () => (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: '30px'
    }}>
      <div style={{ display: 'flex', gap: '10px' }}>
        <button
          onClick={onClose}
          style={{
            padding: '10px 20px',
            backgroundColor: '#f5f5f5',
            color: '#333',
            border: '1px solid #ddd',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <FiX /> Hủy
        </button>
        
        {step > 1 && (
          <button
            onClick={() => setStep(step - 1)}
            style={{
              padding: '10px 20px',
              backgroundColor: '#f5f5f5',
              color: '#333',
              border: '1px solid #ddd',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <FiArrowLeft /> Quay lại
          </button>
        )}
      </div>
      
      <div>
        {step < 3 ? (
          <button
            onClick={() => setStep(step + 1)}
            disabled={
              (step === 1 && !selectedOutfit) ||
              (step === 2 && !selectedFace)
            }
            style={{
              padding: '10px 30px',
              backgroundColor: (step === 1 && selectedOutfit) || (step === 2 && selectedFace) ? '#007bff' : '#ccc',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: (step === 1 && selectedOutfit) || (step === 2 && selectedFace) ? 'pointer' : 'not-allowed',
              fontSize: '14px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            Tiếp theo <FiArrowRight />
          </button>
        ) : (
          <button
            onClick={handleFinish}
            disabled={!selectedOutfit || !selectedFace || !selectedHair}
            style={{
              padding: '10px 30px',
              backgroundColor: (selectedOutfit && selectedFace && selectedHair) ? '#28a745' : '#ccc',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: (selectedOutfit && selectedFace && selectedHair) ? 'pointer' : 'not-allowed',
              fontSize: '14px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <FiCheck /> Hoàn thành
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 10000,
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        width: '800px',
        maxWidth: '90vw',
        maxHeight: '90vh',
        overflow: 'auto',
        padding: '30px',
        position: 'relative'
      }}>
        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '15px',
            right: '15px',
            backgroundColor: 'transparent',
            border: 'none',
            fontSize: '20px',
            cursor: 'pointer',
            color: '#666',
            width: '30px',
            height: '30px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '50%',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f5f5f5'}
        >
          <FiX />
        </button>
        
        <div style={{
          display: 'flex',
          gap: '30px'
        }}>
          {/* Left Column - Preview */}
          <div style={{ flex: 1 }}>
            <h2 style={{
              fontSize: '24px',
              fontWeight: 'bold',
              marginBottom: '10px',
              color: '#333'
            }}>
              Tạo nhân vật LEGO
            </h2>
            <p style={{ color: '#666', marginBottom: '20px', fontSize: '14px' }}>
              Tùy chỉnh nhân vật LEGO theo ý thích của bạn
            </p>
            
            {renderPreview()}
            
            <div style={{
              padding: '15px',
              backgroundColor: '#e7f3ff',
              borderRadius: '8px',
              fontSize: '13px',
              color: '#0066cc'
            }}>
              <strong>💡 Lưu ý:</strong> Nhân vật LEGO sẽ được thêm vào vùng thiết kế dưới dạng một nhóm các layer. 
              Bạn có thể di chuyển toàn bộ nhân vật sau khi tạo.
            </div>
          </div>
          
          {/* Right Column - Steps */}
          <div style={{ flex: 1 }}>
            {renderStepIndicator()}
            
            <div style={{ minHeight: '400px' }}>
              {step === 1 && renderOutfitSelection()}
              {step === 2 && renderFaceSelection()}
              {step === 3 && renderHairSelection()}
            </div>
            
            {renderNavigationButtons()}
          </div>
        </div>
      </div>
    </div>
  );
}