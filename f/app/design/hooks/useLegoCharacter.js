"use client";

import { useEffect, useCallback } from "react";

export function useLegoCharacter({
  LEGO_CONFIG,
  canvasSize,
  stickers,
  setStickers,
  legoCharacters,
  setLegoCharacters,
  selectedCharacterId,
  setSelectedCharacterId,
  legoCharactersRef,

  setSelectedId,
  setActivePanel,

  setShowOutfitSelector,
  setOutfitSelectorCharId,
}) {
  // Luôn dùng config desktop — canvas được scale bởi canvasScale trong Stage
  const isMobile = typeof window !== "undefined" && window.innerWidth < 1024;
  const partConfig = LEGO_CONFIG.partConfig;
  const assemblyConfig = LEGO_CONFIG.assemblyConfig;
  const mobileScale = 1;

  useEffect(() => {
    if (legoCharactersRef) legoCharactersRef.current = legoCharacters;
  }, [legoCharacters, legoCharactersRef]);

  const getCharacterById = useCallback(
    (id) => {
      if (!id) return null;
      return legoCharactersRef?.current?.find((c) => c.id === id) || null;
    },
    [legoCharactersRef],
  );

  const findPriceBySrc = (list, src) => {
    if (!src) return 0;
    const obj = (list || []).find((x) => x?.src === src);
    return Number(obj?.price || 0);
  };
  // Quick tuning knobs for global placement inside the character box
  const FACE_GLOBAL_X = -5;
  const FACE_GLOBAL_Y = -4;
  const HAIR_GLOBAL_X = -4;
  const HAIR_GLOBAL_Y = -4;
  const getFemaleFaceLiftOffset = (faceSrc) =>
    String(faceSrc || "").includes("/images/lego/faces/faceswoman/") ? FACE_GLOBAL_Y : 0;
  const getFemaleFaceXOffset = (faceSrc) =>
    faceSrc ? FACE_GLOBAL_X : 0;
  const getHairLiftOffset = (faceSrc, hairSrc) => {
    const isFace5Or6 =
      faceSrc === "/images/lego/faces/15.png" ||
      faceSrc === "/images/lego/faces/34.png";
    const isHair2Or4 =
      hairSrc === "/images/lego/hair/nam/tocnam2.png" ||
      hairSrc === "/images/lego/hair/nam/tocnam4.png";
    const isFace5 = faceSrc === "/images/lego/faces/15.png";
    const isFemaleHair1 = hairSrc === "/images/lego/hair/nu/tocnu1.png";
    const isFemaleHair2 = hairSrc === "/images/lego/hair/nu/tocnu2.png";
    const isFemaleHair = String(hairSrc || "").includes("/images/lego/hair/nu/");
    const isMaleHair9 = hairSrc === "/images/lego/hair/nam/tocnam9.png";
    const isMaleHair6 = hairSrc === "/images/lego/hair/nam/tocnam6.png";
    const isFemaleHair6 = hairSrc === "/images/lego/hair/nu/tocnu6.png";
    const isFemaleFace6Mat = faceSrc === "/images/lego/faces/faceswoman/matnu6.png";
    
    // Check face matnu6 logic first before early returns
    if (isFemaleFace6Mat) {
      if (hairSrc === "/images/lego/hair/nu/tocnu1.png") {
        return -3;
      }
      if (hairSrc === "/images/lego/hair/nu/tocnu2.png") {
        return -2;
      }
      const isMaleHair1 = hairSrc === "/images/lego/hair/nam/tocnam1.png";
      if (isMaleHair1 || isMaleHair9) {
        return -5;
      }
      const isMaleHairOther = String(hairSrc || "").includes("/images/lego/hair/nam/");
      if (isMaleHairOther) {
        return -3;
      }
      if (isFemaleHair6) {
        return -2;
      }
      return -1.2;
    }
    
    // Early returns for non-matnu6 cases
    if (isMaleHair9) {
      return -2;
    }
    if (isFemaleHair6) {
      return 1;
    }
    const isFemaleFace1Or2Or4 =
      faceSrc === "/images/lego/faces/faceswoman/02.png" ||
      faceSrc === "/images/lego/faces/faceswoman/06.png" ||
      faceSrc === "/images/lego/faces/faceswoman/16.png";
    const isFemaleFace3Or5 =
      faceSrc === "/images/lego/faces/faceswoman/10.png" ||
      faceSrc === "/images/lego/faces/faceswoman/45.png";

    // Existing hair-face adjustments (these happen after matnu6 logic)
    const isTargetFaceForTocnu5 =
      faceSrc === "/images/lego/faces/15.png" ||
      faceSrc === "/images/lego/faces/34.png" ||
      faceSrc === "/images/lego/faces/faceswoman/10.png" ||
      faceSrc === "/images/lego/faces/faceswoman/45.png";
    if (hairSrc === "/images/lego/hair/nu/tocnu5.png" && isTargetFaceForTocnu5) {
      return 0.9;
    }
      faceSrc === "/images/lego/faces/faceswoman/45.png";
    if (isFace5) {
      return -2;
    }
    if (isFace5Or6 && isHair2Or4) {
      return -1;
    }
    if (isFace5 && (isFemaleHair1 || isFemaleHair2)) {
      return -2;
    }
    if (isFemaleFace1Or2Or4 && isFemaleHair2) {
      return -1.5;
    }

    // When female face is 02/06/16, lift Tóc Nữ 1 up by 2px
    if (isFemaleFace1Or2Or4 && isFemaleHair1) {
      return -2;
    }
    // If hair is female 1 and face is NOT 3 or 5, shift hair up 1.5px
    if (isFemaleHair1 && !isFemaleFace3Or5) {
      return -1.5;
    }
    // If hair is female 2 and face is NOT 3 or 5, shift up 1px (legacy)
    if (isFemaleHair2 && !isFemaleFace3Or5) {
      return -1;
    }
    // when female face 3 or 5 with male hair 6, push hair down 1px
    if (isFemaleFace3Or5 && isMaleHair6) {
      return 1;
    }
    if (isFemaleFace3Or5 && isMaleHair9) {
      return 1;
    }
    if (isHair2Or4 && faceSrc) {
      return -1;
    }
    if (
      faceSrc === "/images/lego/faces/faceswoman/10.png" ||
      faceSrc === "/images/lego/faces/faceswoman/45.png"
    ) {
      return -3;
    }
    if (
      faceSrc === "/images/lego/faces/15.png" ||
      faceSrc === "/images/lego/faces/34.png"
    ) {
      return -1;
    }
    return 0;
  };
  const getHairSizeBoostForFace = (faceSrc) => {
    if (
      faceSrc === "/images/lego/faces/15.png" ||
      faceSrc === "/images/lego/faces/34.png"
    ) {
      return 2;
    }
    return 0;
  };
  const getHairSizeMultiplierForFace = (faceSrc, hairSrc) => {
    const isFemaleFace3Or5 =
      faceSrc === "/images/lego/faces/faceswoman/10.png" ||
      faceSrc === "/images/lego/faces/faceswoman/45.png";
    const isFemaleHair2 = hairSrc === "/images/lego/hair/nu/tocnu2.png";
    if (isFemaleFace3Or5 && isFemaleHair2) return 1.03;
    
    // When female face 6 is selected with male hair, increase size by 5%
    const isFemaleFace6 = faceSrc === "/images/lego/faces/faceswoman/matnu6.png";
    const isMaleHair9 = hairSrc === "/images/lego/hair/nam/tocnam9.png";
    if (isFemaleFace6 && isMaleHair9) return 1.08;
    
    const isMaleHair = String(hairSrc || "").includes("/images/lego/hair/nam/");
    if (isFemaleFace6 && isMaleHair) return 1.05;
    
    return 1;
  };
  const getHairFaceXOffset = (faceSrc, hairSrc) => {
    const isMaleHair8 = hairSrc === "/images/lego/hair/nam/tocnam8.png";
    
    // Shift Tóc Nam 8 left 5px
    if (isMaleHair8) {
      return -5;
    }
    
    // Shift Tóc Nam 9 left 5px when with face 6 (total offsetXExtra: -5 + -5 = -10 from base)
    const isFemaleFace6 = faceSrc === "/images/lego/faces/faceswoman/matnu6.png";
    const isMaleHair9 = hairSrc === "/images/lego/hair/nam/tocnam9.png";
    if (isFemaleFace6 && isMaleHair9) {
      return -5;
    }
    
    const isAnyHair = String(hairSrc || "").includes("/images/lego/hair/");
    if (isAnyHair) return HAIR_GLOBAL_X;
    return 0;
  };

  const calculateExactPosition = (character, partType) => {
    const config = partConfig[partType];
    const assembly = assemblyConfig;

    if (!config) return { x: 0, y: 0, width: 0, height: 0 };

    let x = character.x + (config.offsetX || 0);
    let y = character.y + (config.offsetY || 0);

    switch (partType) {
      case "head":
        y -= assembly.headToTorso.overlap || 0;
        break;

      case "torso":
        break;

      case "legs":
        y -= assembly.torsoToLegs.overlap || 0;
        break;

      case "outfit":
        x = character.x + (config.offsetX || 0);
        y = character.y + (partConfig.torso.offsetY || 0);
        break;

      case "face": {
        const headCfg = partConfig.head;
        const headX = character.x + (headCfg.offsetX || 0);
        const headY =
          character.y +
          (headCfg.offsetY || 0) -
          (assembly.headToTorso.overlap || 0);

        // Shift all faces left by FACE_GLOBAL_X (e.g., -4)
        x = headX + (headCfg.width - config.width) / 2 + (config.offsetX || 0) + FACE_GLOBAL_X;
        y = headY + (config.offsetY || 0);
        break;
      }

      case "hair": {
        const headCfg = partConfig.head;
        const headX = character.x + (headCfg.offsetX || 0);
        const headY =
          character.y +
          (headCfg.offsetY || 0) -
          (assembly.headToTorso.overlap || 0);

        x = headX + (headCfg.width - config.width) / 2 + (config.offsetX || 0);
        y = headY + (config.offsetY || 0) - 3;
        break;
      }

      default:
        break;
    }

    return { x, y, width: config.width, height: config.height };
  };

  const createStickersFromCharacter = (character) => {
    const result = [];

    if (character.legs) {
      const pos = calculateExactPosition(character, "legs");
      result.push({
        id: `${character.id}-legs`,
        type: "lego",
        name: "Chân",
        src: character.legs,
        x: pos.x,
        y: pos.y,
        width: pos.width,
        height: pos.height,
        zIndex: partConfig.legs.zIndex,
        isSelected: false,
        layerType: "base",
        part: "legs",
        characterId: character.id,
        isBasePart: true,
        price: Number(character.pants_price || 0),
      });
    }

    if (character.torso) {
      const pos = calculateExactPosition(character, "torso");
      // ✅ outfit hiển thị trên torso => price của outfit gắn vào torso sticker
      result.push({
        id: `${character.id}-torso`,
        type: "lego",
        name: "Thân",
        src: character.outfit || character.torso,
        x: pos.x,
        y: pos.y,
        width: pos.width,
        height: pos.height,
        zIndex: partConfig.torso.zIndex,
        isSelected: false,
        layerType: "base",
        part: "torso",
        characterId: character.id,
        isBasePart: true,
        price: Number(character.outfit_price || 0),
      });
    }

    // Nếu chưa chọn mặt thì hiển thị mặt mặc định (nếu có) thay vì chỉ hiện head gốc
    if (character.head && !character.face) {
      const defaultFaceObj = (LEGO_CONFIG?.faces || [])[0] || null;
      if (defaultFaceObj) {
        const pos = calculateExactPosition(character, "face");
        const faceObj = ([...(LEGO_CONFIG?.faces || []), ...(LEGO_CONFIG?.facesFemale || [])].find((f) => f?.src === defaultFaceObj.src) || defaultFaceObj);
        const faceOffsetYExtra = faceObj?.offsetYExtra || 0;
        const faceWidthAdjust = Number(faceObj?.widthAdjust || 0);
        const faceHeightAdjust = Number(faceObj?.heightAdjust || 0);
        const faceSizeScale = Number(faceObj?.sizeScale || 1);
        const faceWidth = Math.max(1, Math.round(pos.width * faceSizeScale) + faceWidthAdjust);
        const faceHeight = Math.max(1, Math.round(pos.height * faceSizeScale) + faceHeightAdjust);
        const faceX = pos.x + (pos.width - faceWidth) / 2 + (Number(faceObj?.offsetXExtra || 0));
        // debug for face-female-06
        if (faceObj?.src === "/images/lego/faces/faceswoman/06.png") {
          console.log(`[DEBUG][face-female-06] createStickers computed: pos.y=${pos.y}, faceOffsetYExtra=${faceOffsetYExtra}, faceHairShiftY=${(character.hair === "/images/lego/hair/nu/tocnu1.png" && (faceObj?.src === "/images/lego/faces/faceswoman/02.png" || faceObj?.src === "/images/lego/faces/faceswoman/06.png")) ? 1 : 0}, finalY=${pos.y + faceOffsetYExtra + 3 + getFemaleFaceLiftOffset(defaultFaceObj.src || defaultFaceObj) + ((character.hair === "/images/lego/hair/nu/tocnu1.png" && (faceObj?.src === "/images/lego/faces/faceswoman/02.png" || faceObj?.src === "/images/lego/faces/faceswoman/06.png")) ? 1 : 0)}`);
        }
        // shift face down 1px when hair is female 1 and face is female 1 or 2
        const faceHairShiftY = (character.hair === "/images/lego/hair/nu/tocnu1.png" && (faceObj?.src === "/images/lego/faces/faceswoman/02.png" || faceObj?.src === "/images/lego/faces/faceswoman/06.png")) ? 1 : 0;
        result.push({
          id: `${character.id}-face`,
          type: "lego",
          name: "Khuôn mặt",
          src: defaultFaceObj.src || defaultFaceObj,
          x: faceX + getFemaleFaceXOffset(defaultFaceObj.src || defaultFaceObj),
          y: pos.y + faceOffsetYExtra + 3 + getFemaleFaceLiftOffset(defaultFaceObj.src || defaultFaceObj) + faceHairShiftY,
          width: faceWidth,
          height: faceHeight,
          zIndex: partConfig.face.zIndex,
          isSelected: false,
          layerType: "face",
          part: "face",
          characterId: character.id,
          price: 0,
        });
      } else {
        const pos = calculateExactPosition(character, "head");
        result.push({
          id: `${character.id}-head`,
          type: "lego",
          name: "Đầu",
          src: character.head,
          x: pos.x,
          y: pos.y,
          width: pos.width,
          height: pos.height,
          zIndex: partConfig.head.zIndex,
          isSelected: false,
          layerType: "base",
          part: "head",
          characterId: character.id,
          isBasePart: true,
          price: 0,
        });
      }
    }

    // ❌ Xóa phần face (khuôn mặt) để tránh chồng lấp
    // if (character.face) { ... }

    if (character.hair) {
      const pos = calculateExactPosition(character, "hair");
      const hairObj = (LEGO_CONFIG?.hairs || []).find((h) => h?.src === character.hair);
      const offsetYExtra = hairObj?.offsetYExtra || 0;
      const offsetXExtra = hairObj?.offsetXExtra || 0;
      const faceLiftY = getHairLiftOffset(character.face, character.hair);
      const faceShiftX = getHairFaceXOffset(character.face, character.hair);
      const sizeScale = hairObj?.sizeScale || 1;
      const heightAdjust = Number(hairObj?.heightAdjust || 0);
      const hairRotation = Number(hairObj?.rotation || 0);
      const hairSizeBoost = getHairSizeBoostForFace(character.face);
      const hairSizeMultiplier = getHairSizeMultiplierForFace(character.face, character.hair);
      const hairWidthAdjust = Number(hairObj?.widthAdjust || 0);
      const hairW = Math.max(1, Math.round(pos.width * sizeScale * hairSizeMultiplier) + hairSizeBoost + hairWidthAdjust);
      const hairH = Math.max(1, Math.round(pos.height * sizeScale * hairSizeMultiplier) + heightAdjust + hairSizeBoost);
      const computedHairY = pos.y + offsetYExtra + faceLiftY + HAIR_GLOBAL_Y;
      console.log(`[DEBUG][hair-create] hair=${character.hair}, face=${character.face}, multiplier=${hairSizeMultiplier}, faceLiftY=${faceLiftY}, widthAdjust=${hairWidthAdjust}`);

      result.push({
        id: `${character.id}-hair`,
        type: "lego",
        name: "Tóc",
        src: character.hair,
        x: pos.x + (pos.width - hairW) / 2 + offsetXExtra + faceShiftX,
        y: Math.round(computedHairY),
        width: hairW,
        height: hairH,
        rotation: hairRotation,
        zIndex: partConfig.hair.zIndex,
        isSelected: false,
        layerType: "hair",
        part: "hair",
        characterId: character.id,
        price: Number(character.hair_price || 0),
      });
    }

    return result;
  };

  // ✅ ADD LEGO CHARACTER
  const addCompleteLegoCharacter = () => {
    setActivePanel?.(null);
    setSelectedId?.(null);

    const characterId = `lego-${Date.now()}`;

    const safeX = Math.max(
      0,
      Math.min(
        canvasSize.width / 2 - partConfig.totalWidth / 2,
        canvasSize.width - partConfig.totalWidth,
      ),
    );

    const safeY = Math.max(
      0,
      Math.min(
        canvasSize.height / 2 - 150,
        canvasSize.height - partConfig.totalHeight,
      ),
    );

    const defaultFace = LEGO_CONFIG.faces[0]?.src || null;
    const defaultHair = LEGO_CONFIG.hairs[0]?.src || null;

    const NEW_CHARACTER_SHIFT_X = -4;
    const NEW_CHARACTER_SHIFT_Y = -4;
    const initialX = Math.max(0, Math.min(safeX + NEW_CHARACTER_SHIFT_X, canvasSize.width - partConfig.totalWidth));
    const initialY = Math.max(0, Math.min(safeY + NEW_CHARACTER_SHIFT_Y, canvasSize.height - partConfig.totalHeight));

    const newCharacter = {
      id: characterId,
      x: initialX,
      y: initialY,
      head: LEGO_CONFIG.baseParts.head,
      torso: LEGO_CONFIG.baseParts.torso,
      legs: LEGO_CONFIG.baseParts.legs,

      face: null,
      hair: defaultHair,
      outfit: null,

      // ✅ giá mặc định (thường = 0 nếu config không set price)
      outfit_price: 0,
      face_price: 0,
      hair_price: findPriceBySrc(LEGO_CONFIG.hairs, defaultHair),
    };

    setLegoCharacters((prev) => [...prev, newCharacter]);
    setSelectedCharacterId(characterId);

    // ✅ Hiện outfit selector ngay khi user thêm nhân vật mới
    if (setOutfitSelectorCharId) setOutfitSelectorCharId(characterId);
    if (setShowOutfitSelector) setShowOutfitSelector(true);

    const characterStickers = createStickersFromCharacter(newCharacter);

    setStickers((prev) => {
      const cleared = prev.map((s) =>
        s.characterId ? s : { ...s, isSelected: false },
      );
      return [...cleared, ...characterStickers];
    });
  };

  const moveLegoCharacter = (characterId, deltaX, deltaY) => {
    setLegoCharacters((prev) => {
      const next = prev.map((char) => {
        if (char.id !== characterId) return char;

        let newX = char.x + deltaX;
        let newY = char.y + deltaY;

        const maxX = canvasSize.width - partConfig.totalWidth;
        const maxY = canvasSize.height - partConfig.totalHeight;

        newX = Math.max(0, Math.min(newX, maxX));
        newY = Math.max(0, Math.min(newY, maxY));

        return { ...char, x: newX, y: newY };
      });

      const movedChar = next.find((c) => c.id === characterId);

      if (movedChar) {
        setStickers((prevStickers) =>
          prevStickers.map((sticker) => {
            if (sticker.characterId !== characterId) return sticker;
            const pos = calculateExactPosition(movedChar, sticker.part);
            if (sticker.layerType === "hair") {
              const hairObj = (LEGO_CONFIG?.hairs || []).find((h) => h?.src === sticker.src);
              const offsetYExtra = hairObj?.offsetYExtra || 0;
              const offsetXExtra = hairObj?.offsetXExtra || 0;
              const faceLiftY = getHairLiftOffset(movedChar.face, sticker.src);
              const faceShiftX = getHairFaceXOffset(movedChar.face, sticker.src);
              const sizeScale = hairObj?.sizeScale || 1;
              const heightAdjust = Number(hairObj?.heightAdjust || 0);
              const hairRotation = Number(hairObj?.rotation || 0);
              const hairSizeBoost = getHairSizeBoostForFace(movedChar.face);
              const hairSizeMultiplier = getHairSizeMultiplierForFace(movedChar.face, sticker.src);
              const hairWidthAdjust = Number(hairObj?.widthAdjust || 0);
              const hairW = Math.max(1, Math.round(pos.width * sizeScale * hairSizeMultiplier) + hairSizeBoost + hairWidthAdjust);
              const hairH = Math.max(1, Math.round(pos.height * sizeScale * hairSizeMultiplier) + heightAdjust + hairSizeBoost);
              return {
                ...sticker,
                x: pos.x + (pos.width - hairW) / 2 + offsetXExtra + faceShiftX,
                y: Math.round(pos.y + offsetYExtra + faceLiftY + HAIR_GLOBAL_Y),
                width: hairW,
                height: hairH,
                rotation: hairRotation,
              };
            }
            if (sticker.layerType === "face") {
              const faceObj = [...(LEGO_CONFIG?.faces || []), ...(LEGO_CONFIG?.facesFemale || [])].find((f) => f?.src === sticker.src);
              const offsetYExtra = faceObj?.offsetYExtra || 0;
              const widthAdjust = Number(faceObj?.widthAdjust || 0);
              const heightAdjust = Number(faceObj?.heightAdjust || 0);
              const sizeScale = Number(faceObj?.sizeScale || 1);
              const faceWidth = Math.max(1, pos.width * sizeScale + widthAdjust);
              const faceHeight = Math.max(1, pos.height * sizeScale + heightAdjust);
              const faceX = pos.x + (pos.width - faceWidth) / 2 + (Number(faceObj?.offsetXExtra || 0));
              // debug when updating existing face sticker during move
              if (sticker.src === "/images/lego/faces/faceswoman/06.png") {
                console.log(`[DEBUG][face-female-06] moveLegoCharacter update computed: pos.y=${pos.y}, offsetYExtra=${offsetYExtra}, finalY=${pos.y + offsetYExtra + 3 + getFemaleFaceLiftOffset(sticker.src)}`);
              }
              return {
                ...sticker,
                x: faceX + getFemaleFaceXOffset(sticker.src),
                y: pos.y + offsetYExtra + 3 + getFemaleFaceLiftOffset(sticker.src),
                width: faceWidth,
                height: faceHeight,
              };
            }
            return { ...sticker, x: pos.x, y: pos.y };
          }),
        );
      }

      return next;
    });
  };

  // ✅ outfitSrc + price (price lấy từ config nếu không truyền)
  const updateCharacterOutfit = (
    outfitSrc,
    targetCharacterId = selectedCharacterId,
    passedPrice,
  ) => {
    if (!targetCharacterId) {
      alert("Vui lòng chọn một nhân vật LEGO trước!");
      return;
    }

    const outfitObj =
      (LEGO_CONFIG?.legoColors || []).find((o) => o?.src === outfitSrc) || null;
    const outfitPrice = Number(
      Number.isFinite(Number(passedPrice))
        ? passedPrice
        : outfitObj?.price || 0,
    );

    // 1) lưu vào character (optional, để bạn dùng ở nơi khác)
    setLegoCharacters((prev) =>
      prev.map((char) =>
        char.id === targetCharacterId
          ? {
              ...char,
              outfit: outfitSrc,
              outfit_id: outfitObj?.id || null,
              outfit_price: outfitPrice,
            }
          : char,
      ),
    );

    // 2) ✅ cập nhật sticker torso + gắn price để calcPricing cộng được
    setStickers((prev) =>
      prev.map((s) => {
        if (
          s.characterId === targetCharacterId &&
          s.part === "torso" &&
          s.isBasePart
        ) {
          return {
            ...s,
            src: outfitSrc || s.src,
            price: outfitPrice,
          };
        }
        return s;
      }),
    );
  };
  const updateCharacterPants = (
    pantsSrc,
    targetCharacterId = selectedCharacterId,
    passedPrice,
  ) => {
    if (!targetCharacterId) {
      alert("Vui lòng chọn một nhân vật LEGO trước!");
      return;
    }

    const pantsObj =
      (LEGO_CONFIG?.legoPantsColors || []).find((p) => p?.src === pantsSrc) ||
      null;
    const pantsPrice = Number(
      Number.isFinite(Number(passedPrice)) ? passedPrice : pantsObj?.price || 0,
    );

    // 1) lưu vào character
    setLegoCharacters((prev) =>
      prev.map((char) =>
        char.id === targetCharacterId
          ? {
              ...char,
              legs: pantsSrc,
              pants_id: pantsObj?.id || null,
              pants_price: pantsPrice,
            }
          : char,
      ),
    );

    // 2) cập nhật sticker legs + gắn price
    setStickers((prev) =>
      prev.map((s) => {
        if (
          s.characterId === targetCharacterId &&
          s.part === "legs" &&
          s.isBasePart
        ) {
          return {
            ...s,
            src: pantsSrc || s.src,
            price: pantsPrice,
          };
        }
        return s;
      }),
    );
  };
  const updateCharacterFace = (faceSrc, passedPrice) => {
    if (!selectedCharacterId) {
      alert("Vui lòng chọn một nhân vật LEGO trước!");
      return;
    }

    const faceObj =
      [...(LEGO_CONFIG?.faces || []), ...(LEGO_CONFIG?.facesFemale || [])].find((f) => f?.src === faceSrc) || null;
    const facePrice = Number(
      Number.isFinite(Number(passedPrice)) ? passedPrice : faceObj?.price || 0,
    );

    setLegoCharacters((prev) =>
      prev.map((char) =>
        char.id === selectedCharacterId
          ? { ...char, face: faceSrc, face_price: facePrice }
          : char,
      ),
    );

    setStickers((prev) => {
      // Xóa face sticker cũ
      let filtered = prev.filter(
        (s) =>
          !(s.characterId === selectedCharacterId && s.layerType === "face"),
      );

      if (faceSrc) {
        // Ẩn head sticker để tránh mặt gốc chồng lên mặt mới
        filtered = filtered.filter(
          (s) => !(s.characterId === selectedCharacterId && s.part === "head"),
        );

        const character = getCharacterById(selectedCharacterId) || {
          x: 0,
          y: 0,
        };
        const pos = calculateExactPosition(character, "face");
        const faceOffsetYExtra = faceObj?.offsetYExtra || 0;
        const faceWidthAdjust = Number(faceObj?.widthAdjust || 0);
        const faceHeightAdjust = Number(faceObj?.heightAdjust || 0);
        const faceSizeScale = Number(faceObj?.sizeScale || 1);
        const faceWidth = Math.max(1, Math.round(pos.width * faceSizeScale) + faceWidthAdjust);
        const faceHeight = Math.max(1, Math.round(pos.height * faceSizeScale) + faceHeightAdjust);
        const faceX = pos.x + (pos.width - faceWidth) / 2 + (Number(faceObj?.offsetXExtra || 0));
        // debug when setting face sticker via updateCharacterFace
        if (faceSrc === "/images/lego/faces/faceswoman/06.png") {
          console.log(`[DEBUG][face-female-06] updateCharacterFace computed: pos.y=${pos.y}, faceOffsetYExtra=${faceOffsetYExtra}, finalY=${pos.y + faceOffsetYExtra + 3 + getFemaleFaceLiftOffset(faceSrc)}`);
        }
        filtered.push({
          id: `${selectedCharacterId}-face`,
          type: "lego",
          name: "Khuôn mặt",
          src: faceSrc,
          x: faceX + getFemaleFaceXOffset(faceSrc),
          y: pos.y + faceOffsetYExtra + 3 + getFemaleFaceLiftOffset(faceSrc),
          width: faceWidth,
          height: faceHeight,
          zIndex: partConfig.face.zIndex,
          isSelected: false,
          layerType: "face",
          part: "face",
          characterId: selectedCharacterId,
          price: facePrice, // ✅ QUAN TRỌNG
        });
      } else {
        // Không có mặt mới → hiện lại head gốc nếu chưa có
        const character = getCharacterById(selectedCharacterId);
        const headExists = filtered.some(
          (s) => s.characterId === selectedCharacterId && s.part === "head",
        );
        if (!headExists && character?.head) {
          const pos = calculateExactPosition(character, "head");
          filtered.push({
            id: `${selectedCharacterId}-head`,
            type: "lego",
            name: "Đầu",
            src: character.head,
            x: pos.x,
            y: pos.y,
            width: pos.width,
            height: pos.height,
            zIndex: partConfig.head.zIndex,
            isSelected: false,
            layerType: "base",
            part: "head",
            characterId: selectedCharacterId,
            isBasePart: true,
            price: 0,
          });
        }
      }

      const faceLiftY = getHairLiftOffset(faceSrc, null);
      filtered = filtered.map((s) => {
        if (!(s.characterId === selectedCharacterId && s.layerType === "hair")) return s;
        const character = getCharacterById(selectedCharacterId) || { x: 0, y: 0 };
        const pos = calculateExactPosition(character, "hair");
        const hairObj = (LEGO_CONFIG?.hairs || []).find((h) => h?.src === s.src);
        const hairOffsetYExtra = hairObj?.offsetYExtra || 0;
        const hairOffsetXExtra = hairObj?.offsetXExtra || 0;
        const hairSizeScale = hairObj?.sizeScale || 1;
        const hairHeightAdjust = Number(hairObj?.heightAdjust || 0);
        const hairRotation = Number(hairObj?.rotation || 0);
        const hairSizeBoost = getHairSizeBoostForFace(faceSrc);
        const faceShiftX = getHairFaceXOffset(faceSrc, s.src);
        const hairSizeMultiplier = getHairSizeMultiplierForFace(faceSrc, s.src);
        const hairWidthAdjust = Number(hairObj?.widthAdjust || 0);
        const hairW = Math.max(1, Math.round(pos.width * hairSizeScale * hairSizeMultiplier) + hairSizeBoost + hairWidthAdjust);
        const hairH = Math.max(1, Math.round(pos.height * hairSizeScale * hairSizeMultiplier) + hairHeightAdjust + hairSizeBoost);
        return {
          ...s,
          x: pos.x + (pos.width - hairW) / 2 + hairOffsetXExtra + faceShiftX,
          y: Math.round(pos.y + hairOffsetYExtra + getHairLiftOffset(faceSrc, s.src) + HAIR_GLOBAL_Y),
          width: hairW,
          height: hairH,
          rotation: hairRotation,
        };
      });

      return filtered;
    });
  };

  const updateCharacterHair = (hairSrc, passedPrice) => {
    if (!selectedCharacterId) {
      alert("Vui lòng chọn một nhân vật LEGO trước!");
      return;
    }

    const hairObj =
      (LEGO_CONFIG?.hairs || []).find((h) => h?.src === hairSrc) || null;
    const hairPrice = Number(
      Number.isFinite(Number(passedPrice)) ? passedPrice : hairObj?.price || 0,
    );

    setLegoCharacters((prev) =>
      prev.map((char) =>
        char.id === selectedCharacterId
          ? { ...char, hair: hairSrc, hair_price: hairPrice }
          : char,
      ),
    );

    setStickers((prev) => {
      const filtered = prev.filter(
        (s) =>
          !(s.characterId === selectedCharacterId && s.layerType === "hair"),
      );

      if (hairSrc) {
        const character = getCharacterById(selectedCharacterId) || {
          x: 0,
          y: 0,
        };
        const pos = calculateExactPosition(character, "hair");
        const hairOffsetYExtra = hairObj?.offsetYExtra || 0;
        const hairOffsetXExtra = hairObj?.offsetXExtra || 0;
        const faceLiftY = getHairLiftOffset(character.face, hairSrc);
        const faceShiftX = getHairFaceXOffset(character.face, hairSrc);
        const hairSizeScale = hairObj?.sizeScale || 1;
        const hairHeightAdjust = Number(hairObj?.heightAdjust || 0);
        const hairRotation = Number(hairObj?.rotation || 0);
        const hairSizeBoost = getHairSizeBoostForFace(character.face);
        const hairSizeMultiplier = getHairSizeMultiplierForFace(character.face, hairSrc);
        const hairWidthAdjust = Number(hairObj?.widthAdjust || 0);
        const hairW = Math.max(1, Math.round(pos.width * hairSizeScale * hairSizeMultiplier) + hairSizeBoost + hairWidthAdjust);
        const hairH = Math.max(1, Math.round(pos.height * hairSizeScale * hairSizeMultiplier) + hairHeightAdjust + hairSizeBoost);
        filtered.push({
          id: `${selectedCharacterId}-hair`,
          type: "lego",
          name: "Tóc",
          src: hairSrc,
          x: pos.x + (pos.width - hairW) / 2 + hairOffsetXExtra + faceShiftX,
          y: Math.round(pos.y + hairOffsetYExtra + faceLiftY + HAIR_GLOBAL_Y),
          width: hairW,
          height: hairH,
          rotation: hairRotation,
          zIndex: partConfig.hair.zIndex,
          isSelected: false,
          layerType: "hair",
          part: "hair",
          characterId: selectedCharacterId,
          price: hairPrice, // ✅ QUAN TRỌNG
        });
      }

      return filtered;
    });
  };

  const handleDeleteCharacter = (characterId) => {
    setLegoCharacters((prev) => prev.filter((char) => char.id !== characterId));
    setStickers((prev) =>
      prev.filter((sticker) => sticker.characterId !== characterId),
    );

    if (selectedCharacterId === characterId) setSelectedCharacterId(null);
    setActivePanel?.(null);
    setSelectedId?.(null);
  };

  return {
    calculateExactPosition,
    createStickersFromCharacter,
    addCompleteLegoCharacter,
    moveLegoCharacter,
    updateCharacterOutfit,
    updateCharacterPants,
    updateCharacterFace,
    updateCharacterHair,
    handleDeleteCharacter,
  };
}



