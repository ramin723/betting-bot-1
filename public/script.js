console.log("JavaScript is loaded and working.");  // پیام شروع

document.getElementById('betting-form').addEventListener('submit', function(event) {
    event.preventDefault(); // جلوگیری از ارسال پیش‌فرض فرم
    console.log("Form submitted.");  // پیام ارسال فرم

    const selectedOption = document.querySelector('input[name="betting-option"]:checked');
    if (selectedOption) {
        console.log(`Selected option: ${selectedOption.value}`);  // پیام گزینه انتخاب شده
    } else {
        console.log("No option selected!");  // پیام در صورت عدم انتخاب گزینه
    }

    // ساختن یک شیء برای ارسال داده‌ها
    const formData = new URLSearchParams();
    formData.append('bet', selectedOption ? selectedOption.value : "none");

    // ارسال داده‌ها به سرور با استفاده از fetch API
    fetch('/place-bet', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: formData
    })
    .then(response => response.text())
    .then(data => {
        console.log('Success:', data);
        alert('شرط‌بندی شما ثبت شد!');
    })
    .catch((error) => {
        console.error('Error:', error);
    });
});
s