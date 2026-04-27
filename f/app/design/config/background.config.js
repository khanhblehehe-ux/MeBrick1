export const BACKGROUND_OPTIONS = [

  // ===== HAPPY BIRTHDAY =====
  { id: "bg-light-gray", name: "Happy Birthday ver 1", category: "Happy Birthday", type: "pattern", value: "url('/images/hero/products/HAPPYBIRTHDAY.png')", thumbnail: "/images/hero/products/HAPPYBIRTHDAY.png", backgroundSize: "contain", slots: [
    { id: "s1", x: 53,  y: 387, w: 177, h: 102 },
  ], textFields: [
    { id: "tf-name",      x: 266, y: 158, w: 265, h: 18, placeholder: "Nhập tên..." },
    { id: "tf-level",     x: 266, y: 195, w: 265, h: 18, placeholder: "Nhập tuổi..." },
    { id: "tf-hobby-box", x: 266, y: 233, w: 247, h: 18, placeholder: "Nhập thông tin..." },
    { id: "tf-hobby",     x: 293, y: 398, w: 247, h: 18, placeholder: "Nhập thông tin..." },
  ] },
  { id: "bg-ocean", name: "Happy Birthday ver 2", category: "Happy Birthday", type: "pattern", value: "url('/images/hero/products/HAPPYBIRTHDAY2.png')", thumbnail: "/images/hero/products/HAPPYBIRTHDAY2.png", backgroundSize: "contain", slots: [
    { id: "s0", x: 54,  y: 142, w: 120, h: 119, rotate: -18 },
    { id: "s1", x: 178, y: 172, w: 115, h: 113, rotate: 10 },
  ], textFields: [
    { id: "tf-hobby", x: 293, y: 398, w: 247, h: 18, placeholder: "Nhập thông tin..." },
  ] },

  // ===== HAPPY TOGETHER =====
  { id: "bg-sunset", name: "Happy Together ver 1", category: "Happy Together", type: "pattern", value: "url('/images/hero/products/HAPPYTOGETHER.png')", thumbnail: "/images/hero/products/HAPPYTOGETHER.png", backgroundSize: "contain", slots: [
    { id: "s4", x: 42,  y: 385, w: 82,  h: 50 },
    { id: "s0", x: 297, y: 125, w: 105, h: 99 },
    { id: "s1", x: 400, y: 121, w: 95, h: 102 },
    { id: "s2", x: 295, y: 224, w: 101, h: 107 },
    { id: "s3", x: 400, y: 224, w: 100, h: 107 },
  ], textFields: [
    { id: "tf-hobby", x: 293, y: 404, w: 247, h: 18, placeholder: "Nhập thông tin..." },
  ] },

  // ===== ẢNH MẪU (sample4 – sample56) =====
  ...Array.from({ length: 53 }, (_, i) => {
    const n = i + 4;
    const skip = [4, 50];
    if (skip.includes(n)) return null;
    const customNames = {
      // Happy Birthday (ver 3–12, tiếp nối ver 1=bg-light-gray, ver 2=bg-ocean)
      16: "Happy Birthday ver 3",
      17: "Happy Birthday ver 4",
      29: "Happy Birthday ver 5",
      34: "Happy Birthday ver 6",
      35: "Happy Birthday ver 7",
      36: "Happy Birthday ver 8",
      37: "Happy Birthday ver 9",
      49: "Happy Birthday ver 10",
       8: "Happy Birthday ver 11",
      13: "Happy Birthday ver 12",
      // Special Day ver 1–17
       5: "Special Day ver 1",
       6: "Special Day ver 2",
       7: "Special Day ver 3",
      18: "Special Day ver 4",
      28: "Special Day ver 5",
      30: "Special Day ver 6",
      40: "Special Day ver 7",
      41: "Special Day ver 8",
      42: "Special Day ver 9",
      44: "Happy Together ver 2",
      45: "Happy Together ver 3",
      46: "Special Day ver 12",
      47: "Special Day ver 13",
      48: "Special Day ver 14",
      51: "Special Day ver 15",
      52: "Special Day ver 16",
      56: "Special Day ver 17",
      // Love ver 1–13
       9: "Love ver 1",
      10: "Love ver 2",
      11: "Love ver 3",
      12: "Love ver 4",
      14: "Love ver 5",
      15: "Love ver 6",
      22: "Love ver 7",
      23: "Love ver 8",
      24: "Love ver 9",
      25: "Love ver 10",
      26: "Love ver 11",
      31: "Love ver 12",
      32: "Love ver 13",
      // Happy Anniversary ver 1–4
      19: "Happy Anniversary ver 1",
      20: "Happy Anniversary ver 2",
      21: "Happy Anniversary ver 3",
      43: "Happy Anniversary ver 4",
      // Graduation ver 1–4
      27: "Graduation ver 1",
      33: "Graduation ver 2",
      38: "Graduation ver 3",
      39: "Graduation ver 4",
      // Football ver 1–3
      53: "Football ver 1",
      54: "Football ver 2",
      55: "Football ver 3",
    };
    const customCategories = {
      16: "Happy Birthday", 17: "Happy Birthday", 29: "Happy Birthday",
      34: "Happy Birthday", 35: "Happy Birthday", 36: "Happy Birthday",
      37: "Happy Birthday", 49: "Happy Birthday",  8: "Happy Birthday",
      13: "Happy Birthday",
       5: "Special Day",  6: "Special Day",  7: "Special Day",
      18: "Special Day", 28: "Graduation", 30: "Special Day",
      40: "Special Day", 41: "Special Day", 42: "Special Day",
      44: "Happy Together", 45: "Happy Together", 46: "Special Day",
      47: "Special Day", 48: "Special Day", 51: "Special Day",
      52: "Special Day", 56: "Special Day",
       9: "Love", 10: "Love", 11: "Love", 12: "Love",
      14: "Love", 15: "Love", 22: "Love", 23: "Love",
      24: "Love", 25: "Love", 26: "Love", 31: "Love", 32: "Love",
      19: "Happy Anniversary", 20: "Happy Anniversary",
      21: "Happy Anniversary", 43: "Happy Anniversary",
      27: "Graduation", 33: "Graduation", 38: "Graduation", 39: "Graduation",
      53: "Football", 54: "Football", 55: "Football",
    };
    // Photo slots (tọa độ đã scale từ 1080×1080 → 550×550)
    const slotsMap = {
      4: [
        { id: "s1", x: -9, y: 0, w: 0, h: 0 }, // TODO: Cập nhật y, w, h đúng nếu cần
      ],
      5: [
        { id: "s1", x: 53,  y: 387, w: 177, h: 102 },
      ],
      8: [
        { id: "s1", x: 59,  y: 380, w: 164, h: 102 },
      ],
      6: [
        { id: "s1", x: 38,  y: 379, w: 222, h: 125 },
        { id: "s2", x: 275, y: 377, w: 64,  h: 56  },
      ],
      17: [
        { id: "s1", x: 47,  y: 337, w: 178, h: 128 },
      ],
      16: [
        { id: "s1", x: 277, y: 158, w: 108, h: 101, rotate: -15 },
        { id: "s2", x: 388, y: 178, w: 102, h: 93, rotate: 6 },
      ],
      7: [
        { id: "s1", x: 43,  y: 377, w: 61,  h: 54  },
        { id: "s2", x: 309, y: 379, w: 41,  h: 42  },
        { id: "s3", x: 309, y: 420, w: 41,  h: 39  },
        { id: "s4", x: 309, y: 461, w: 42,  h: 42  },
      ],
      9: [
        { id: "s1", x: 43,  y: 377, w: 61,  h: 59  },
        { id: "s2", x: 309, y: 379, w: 41,  h: 42  },
        { id: "s3", x: 309, y: 420, w: 41,  h: 39  },
        { id: "s4", x: 309, y: 461, w: 42,  h: 42  },
      ],
      10: [
        { id: "s1", x: 45, y: 377, w: 78, h: 52 },
      ],
      11: [
        { id: "s1", x: 63,  y: 209, w: 82,  h: 78, rotate: -16 },
        { id: "s2", x: 146, y: 220, w: 80,  h: 73,  rotate: 4 },
        { id: "s3", x: 46,  y: 367, w: 65,  h: 83 },
      ],
      12: [
        { id: "s1", x: 43,  y: 377, w: 61,  h: 53  },
        { id: "s2", x: 309, y: 379, w: 41,  h: 47  },
        { id: "s3", x: 309, y: 420, w: 41,  h: 44  },
        { id: "s4", x: 309, y: 461, w: 42,  h: 47  },
      ],
      13: [
        { id: "s1", x: 43,  y: 377, w: 61,  h: 59  },
        { id: "s2", x: 309, y: 379, w: 41,  h: 47  },
        { id: "s3", x: 309, y: 420, w: 41,  h: 44  },
        { id: "s4", x: 309, y: 461, w: 42,  h: 47  },
      ],
      14: [
        { id: "s1", x: 71,  y: 217, w: 60,  h: 58, rotate: -16 },
        { id: "s2", x: 132, y: 227, w: 55,  h: 55, rotate: 4 },
        { id: "s3", x: 44,  y: 388, w: 63,  h: 61 },
        { id: "s4", x: 308, y: 385, w: 48,  h: 65 },
      ],
      47: [
        { id: "s1", x: 317, y: 153, w: 108, h: 101, rotate: -10 },
        { id: "s2", x: 413, y: 188, w: 102, h: 93,  rotate: 6 },
      ],
      15: [
        { id: "s1", x: 43,  y: 377, w: 61,  h: 53  },
        { id: "s2", x: 309, y: 379, w: 41,  h: 47  },
        { id: "s3", x: 309, y: 420, w: 41,  h: 44  },
        { id: "s4", x: 309, y: 461, w: 42,  h: 47  },
      ],
      19: [
        { id: "s0", x: 38,  y: 178, w: 211, h: 160 },
        { id: "s1", x: 38,  y: 344, w: 211, h: 163 },
      ],
      20: [],
      21: [],
      42: [
        { id: "s1", x: 54,  y: 316, w: 105, h: 143 },
        { id: "s2", x: 167, y: 316, w: 105, h: 143 },
        { id: "s3", x: 280, y: 316, w: 105, h: 143 },
        { id: "s4", x: 393, y: 316, w: 105, h: 143 },
      ],
      43: [
        { id: "s0", x: 80,  y: 128, w: 100, h: 100, rotate: -10 },
        { id: "s1", x: 218, y: 114,  w: 102, h: 96, rotate:  0 },
        { id: "s2", x: 365, y: 138, w: 101, h: 98, rotate: 17 },
        { id: "s3", x: 66,  y: 458, w: 58,  h: 54,  rotate:  0 },
        { id: "s4", x: 302, y: 453, w: 44,  h: 60,  rotate: 1 },
      ],
      45: [
        { id: "s1", x: 352, y: 133, w: 106, h: 106, rotate: -15 },
        { id: "s2", x: 412, y: 223, w: 100, h: 92,  rotate: 14 },
        { id: "s3", x: 61,  y: 386, w: 84,  h: 60 },
      ],
      48: [
        { id: "s0", x: 73,  y: 76, w: 100, h: 100, rotate: -10 },
        { id: "s5", x: 211, y: 62,  w: 102, h: 96, rotate:  0 },
        { id: "s6", x: 358, y: 86, w: 101, h: 98, rotate: 17 },
        { id: "s1", x: 64,  y: 392, w: 57,  h: 49  },
        { id: "s2", x: 317, y: 389, w: 37,  h: 39  },
        { id: "s3", x: 317, y: 430, w: 37,  h: 36  },
        { id: "s4", x: 317, y: 471, w: 38,  h: 39  },
      ],
      36: [
        { id: "s1", x: 90,  y: 132, w: 98, h: 94, rotate: -10 },
        { id: "s2", x: 224, y: 118, w: 98, h: 98, rotate:   0 },
        { id: "s3", x: 349, y: 130, w: 98, h: 90, rotate:   5 },
      ],
      37: [
        { id: "s1", x: 90,  y: 132, w: 98, h: 94, rotate: -10 },
        { id: "s2", x: 224, y: 118, w: 98, h: 98, rotate:   0 },
        { id: "s3", x: 349, y: 130, w: 98, h: 90, rotate:   5 },
      ],
      56: [
        { id: "s1", x: 54,  y: 316, w: 105, h: 143 },
        { id: "s2", x: 167, y: 316, w: 105, h: 143 },
        { id: "s3", x: 280, y: 316, w: 105, h: 143 },
        { id: "s4", x: 393, y: 316, w: 105, h: 143 },
      ],
    };
    const defaultTextFields = [];
    const textFieldsMap = {
      5: [
        { id: "tf-name",      x: 266, y: 158, w: 247, h: 18, placeholder: "Nhập tên..." },
        { id: "tf-level",     x: 266, y: 195, w: 247, h: 18, placeholder: "Nhập tuổi..." },
        { id: "tf-manifesto", x: 266, y: 232, w: 247, h: 18, placeholder: "Nhập mong ước..." },
        { id: "tf-hobby",     x: 293, y: 398, w: 247, h: 18, placeholder: "Nhập thông tin..." },
      ],
      17: [
        { id: "tf-name",    x: 275, y: 169, w: 265, h: 20, placeholder: "Nhập tên (TO)..." },
        { id: "tf-date",    x: 285, y: 196, w: 260, h: 20, placeholder: "Nhập ngày (DATE)..." },
        { id: "tf-msg1",    x: 245, y: 217, w: 320, h: 20, placeholder: "Dòng tin nhắn 1..." },
        { id: "tf-msg2",    x: 245, y: 243, w: 320, h: 20, placeholder: "Dòng tin nhắn 2..." },
        { id: "tf-msg3",    x: 245, y: 268, w: 320, h: 20, placeholder: "Dòng tin nhắn 3..." },
        { id: "tf-account", x: 288, y: 348, w: 182, h: 22, placeholder: "Nhập tên tài khoản..." },
        { id: "tf-message", x: 265, y: 388, w: 220, h: 85,  placeholder: "Nhập lời nhắn...", multiline: true },
      ],
      40: [
        { id: "tf-message", x: 90, y: 370, w: 375, h: 65, placeholder: "Nhập lời nhắn...", multiline: true }
      ],
      41: [
        { id: "tf-message", x: 90, y: 370, w: 375, h: 65, placeholder: "Nhập lời nhắn...", multiline: true }
      ],
      6: [
        { id: "tf-name",      x: 266, y: 158, w: 247, h: 18, placeholder: "Nhập tên..." },
        { id: "tf-level",     x: 266, y: 195, w: 247, h: 18, placeholder: "Nhập tuổi..." },
        { id: "tf-manifesto", x: 266, y: 232, w: 247, h: 18, placeholder: "Nhập mong ước..." },
      ],
      8: [
        { id: "tf-hobby",     x: 293, y: 398, w: 247, h: 18, placeholder: "Nhập thông tin..." },
      ],
      10: [
        { id: "tf-hobby",     x: 293, y: 398, w: 247, h: 18, placeholder: "Nhập thông tin..." },
      ],
      11: [
        { id: "tf-hobby",     x: 293, y: 398, w: 247, h: 18, placeholder: "Nhập thông tin..." },
      ],
      // Love ver 4 (sample12)
      12: [],
      17: [
        { id: "tf-name",    x: 275, y: 169, w: 265, h: 20, placeholder: "Nhập tên (TO)..." },
        { id: "tf-date",    x: 285, y: 196, w: 260, h: 20, placeholder: "Nhập ngày (DATE)..." },
        { id: "tf-msg1",    x: 245, y: 217, w: 320, h: 20, placeholder: "Dòng tin nhắn 1..." },
        { id: "tf-msg2",    x: 245, y: 243, w: 320, h: 20, placeholder: "Dòng tin nhắn 2..." },
        { id: "tf-msg3",    x: 245, y: 268, w: 320, h: 20, placeholder: "Dòng tin nhắn 3..." },
        { id: "tf-account", x: 288, y: 348, w: 182, h: 22, placeholder: "Nhập tên tài khoản..." },
        { id: "tf-message", x: 265, y: 388, w: 220, h: 85,  placeholder: "Nhập lời nhắn...", multiline: true },
      ],
      40: [
        { id: "tf-message", x: 90, y: 370, w: 375, h: 65, placeholder: "Nhập lời nhắn...", multiline: true }
      ],
      41: [
        { id: "tf-message", x: 90, y: 370, w: 375, h: 65, placeholder: "Nhập lời nhắn...", multiline: true }
      ],
      49: [
        { id: "tf-hobby",   x: 293, y: 398, w: 247, h: 18, placeholder: "Nhập thông tin..." },
      ],
      // Special Day ver 11 (sample-45)
      45: [
        { id: "tf-hobby",   x: 293, y: 408, w: 247, h: 18, placeholder: "Nhập thông tin..." },
      ],
      // Special Day ver 12 (sample-46)
      46: [
        { id: "tf-hobby",   x: 293, y: 398, w: 247, h: 18, placeholder: "Nhập thông tin..." },
      ],
      // HB ver 6 (sample-34)
      34: [
        { id: "tf-message", x: 78, y: 404, w: 400, h: 85, placeholder: "Nhập lời nhắn...", multiline: true },
      ],
      // HB ver 7 (sample-35)
      35: [
        { id: "tf-message", x: 78, y: 404, w: 400, h: 85, placeholder: "Nhập lời nhắn...", multiline: true },
      ],
      // HB ver 8 (sample-36)
      36: [
        { id: "tf-message", x: 78, y: 417, w: 400, h: 85, placeholder: "Nhập lời nhắn...", multiline: true },
      ],
      // HB ver 9 (sample-37)
      37: [
        { id: "tf-message", x: 78, y: 417, w: 400, h: 85, placeholder: "Nhập lời nhắn...", multiline: true },
      ],
    };
    return {
      id: `bg-sample-${n}`,
      name: customNames[n] ?? `Mẫu ${n}`,
      category: customCategories[n] ?? "Khác",
      type: "pattern",
      value: `url('/samples/sample${n}.png')`,
      thumbnail: `/samples/sample${n}.png`,
      backgroundSize: "contain",
      slots: slotsMap[n] ?? [],
      ...(textFieldsMap[n] ? { textFields: textFieldsMap[n] } : { textFields: defaultTextFields }),
    };
  }).filter(Boolean),

  // ===== 8 NỀN MỚI =====
  { id: "bg-new-52", name: "Happy Anniversary ver 5", category: "Happy Anniversary", type: "pattern", value: "url('/samples/52.jpg')", thumbnail: "/samples/52.jpg", backgroundSize: "contain", slots: [], textFields: [] },
  { id: "bg-new-53", name: "Happy Anniversary ver 6", category: "Happy Anniversary", type: "pattern", value: "url('/samples/53.jpg')", thumbnail: "/samples/53.jpg", backgroundSize: "contain", slots: [
    { id: "s1", x: 35,  y: 233, w: 70, h: 70, rotate: -15 },
    { id: "s2", x: 105, y: 251, w: 62, h: 62, rotate: 9 },
    { id: "s3", x: 171, y: 247, w: 67, h: 62, rotate: -9 },
  ], textFields: [
    { id: "tf-hobby", x: 293, y: 408, w: 247, h: 18, placeholder: "Nhập thông tin..." },
  ] },
  { id: "bg-new-54", name: "Special Day ver 22",      category: "Special Day",        type: "pattern", value: "url('/samples/54.jpg')", thumbnail: "/samples/54.jpg", backgroundSize: "contain", slots: [
    { id: "s1", x: 44,  y: 143, w: 97, h: 93 },
    { id: "s2", x: 162, y: 143, w: 97, h: 93 },
    { id: "s3", x: 280, y: 143, w: 97, h: 93 },
    { id: "s4", x: 399, y: 143, w: 99, h: 93 },
  ], textFields: [
    { id: "tf-hobby", x: 293, y: 398, w: 247, h: 18, placeholder: "Nhập thông tin..." },
  ] },
  { id: "bg-new-57", name: "Happy Birthday ver 13",   category: "Happy Birthday",     type: "pattern", value: "url('/samples/57.jpg')", thumbnail: "/samples/57.jpg", backgroundSize: "contain", slots: [
    { id: "s1", x: 29,  y: 234, w: 78, h: 75, rotate: -18 },
    { id: "s2", x: 107, y: 243, w: 75, h: 72, rotate: 2 },
    { id: "s3", x: 183, y: 229, w: 75, h: 72, rotate: -8 },
  ], textFields: [] },
  { id: "bg-new-58", name: "Happy Birthday ver 14",   category: "Happy Birthday",     type: "pattern", value: "url('/samples/58.jpg')", thumbnail: "/samples/58.jpg", backgroundSize: "contain", slots: [], textFields: [] },
  { id: "bg-new-59", name: "Happy Birthday ver 15",   category: "Happy Birthday",     type: "pattern", value: "url('/samples/59.jpg')", thumbnail: "/samples/59.jpg", backgroundSize: "contain", slots: [
    { id: "s1", x: 90,  y: 132, w: 98, h: 94, rotate: -10 },
    { id: "s2", x: 224, y: 118, w: 98, h: 98, rotate: 0 },
    { id: "s3", x: 349, y: 130, w: 98, h: 90, rotate: 5 },
  ], textFields: [] },
  { id: "bg-new-61", name: "Happy Anniversary ver 3", category: "Happy Anniversary",  type: "pattern", value: "url('/samples/61.jpg')", thumbnail: "/samples/61.jpg", backgroundSize: "contain", slots: [], textFields: [] },
  { id: "bg-new-62", name: "Special Day ver 23", category: "Special Day", type: "pattern", value: "url('/samples/62.png')", thumbnail: "/samples/62.png", backgroundSize: "contain", slots: [], textFields: [] },
  { id: "bg-new-63", name: "Special Day ver 24", category: "Special Day", type: "pattern", value: "url('/samples/63.png')", thumbnail: "/samples/63.png", backgroundSize: "contain", slots: [], textFields: [] },
  { id: "bg-new-64", name: "Special Day ver 25", category: "Special Day", type: "pattern", value: "url('/samples/64.png')", thumbnail: "/samples/64.png", backgroundSize: "contain", slots: [], textFields: [] },
  { id: "bg-new-65", name: "Special Day ver 26", category: "Special Day", type: "pattern", value: "url('/samples/65.png')", thumbnail: "/samples/65.png", backgroundSize: "contain", slots: [], textFields: [] },
  { id: "bg-new-66", name: "Special Day ver 27", category: "Special Day", type: "pattern", value: "url('/samples/66.png')", thumbnail: "/samples/66.png", backgroundSize: "contain", slots: [], textFields: [] },
  { id: "bg-new-67", name: "Special Day ver 28", category: "Special Day", type: "pattern", value: "url('/samples/67.png')", thumbnail: "/samples/67.png", backgroundSize: "contain", slots: [], textFields: [] },
  { id: "bg-new-moi", name: "Happy Together ver 11",  category: "Happy Together",     type: "pattern", value: "url('/samples/moi.jpg')", thumbnail: "/samples/moi.jpg", backgroundSize: "contain", slots: [
    { id: "s1", x: 72,  y: 98, w: 116, h: 117 },
    { id: "s2", x: 110, y: 234, w: 117, h: 108, rotate: 6 },
  ], textFields: [] },
];


