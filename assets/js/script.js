// -----------------------------
// (1) ПАРАЛЛАКС-ЭФФЕКТ ТЕКСТА
// -----------------------------
// При скролле двигаем hero-text-container, создавая эффект
// "отдельного" движения текста на фоне фиксированного изображения.
window.addEventListener('scroll', function() {
    // Ищем все блоки, где есть hero-text-container с id heroParallaxText
    // (делаем выборку, потому что на каждой странице может быть свой hero).
    const parallaxText = document.getElementById('heroParallaxText');
    if (parallaxText) {
        // Чем меньше коэффициент, тем медленнее движение текста
        let scrollPos = window.pageYOffset;
        parallaxText.style.transform = 'translate(-50%, calc(-50% + ' + scrollPos * 0.3 + 'px))';
    }
});

// -----------------------------
// (5) ИЗМЕНЕНИЕ ЦВЕТА ХЕДЕРА ПРИ ПРОКРУТКЕ
// -----------------------------
window.addEventListener('scroll', function() {
    var header = document.getElementById('header');
    if (!header) return;
    if (window.scrollY > 50) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
});

// -----------------------------
// (3) КНОПКИ ПРОКРУТКИ И "ДОБАВИТЬ ПОСТ" (появление при скролле)
// ОТСЛЕЖИВАЕМ НАПРАВЛЕНИЕ СКРОЛЛА.
// -----------------------------
let lastScrollTop = 0;
window.addEventListener('scroll', function() {
    const scrollTopBtn = document.getElementById('scrollTop');
    const openFormBtn = document.getElementById('openFormBtn');

    // Логика для кнопки "Наверх" (появляется после 300px)
    if (scrollTopBtn) {
        if (window.scrollY > 300) {
            scrollTopBtn.classList.add('show-btn');
        } else {
            scrollTopBtn.classList.remove('show-btn');
        }
    }

    // Логика для кнопки "Добавить пост"
    // Появляется, если пользователь скроллит вниз,
    // и исчезает, если пользователь скроллит вверх.
    if (openFormBtn) {
        let currentScroll = window.pageYOffset || document.documentElement.scrollTop;
        if (currentScroll > lastScrollTop) {
            // Скроллим вниз
            openFormBtn.classList.add('show-btn');
        } else {
            // Скроллим вверх
            openFormBtn.classList.remove('show-btn');
        }
        lastScrollTop = currentScroll <= 0 ? 0 : currentScroll;
    }
});

// При клике на кнопку "Наверх" прокручиваем страницу в начало
document.addEventListener('DOMContentLoaded', function() {
    const scrollTopBtn = document.getElementById('scrollTop');
    if (scrollTopBtn) {
        scrollTopBtn.addEventListener('click', function() {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
});

/* -----------------------------
   ЛОГИКА ДОБАВЛЕНИЯ/РЕДАКТИРОВАНИЯ/УДАЛЕНИЯ ПОСТОВ
----------------------------- */

// Функции работы с localStorage
function loadPostsFromLocalStorage() {
    const stored = localStorage.getItem('blogPosts');
    return stored ? JSON.parse(stored) : [];
}
function savePostsToLocalStorage(posts) {
    localStorage.setItem('blogPosts', JSON.stringify(posts));
}

// Рендерим посты
function renderPosts(postsArray) {
    const blogPostsContainer = document.getElementById('blog-posts');
    if (!blogPostsContainer) return;

    blogPostsContainer.innerHTML = '';

    postsArray.forEach(post => {
        // Создаём основной блок
        const postDiv = document.createElement('div');
        postDiv.classList.add('blog-post');
        // Добавим ID, чтобы корректно обработать удаление (fade-out)
        postDiv.id = 'post-' + post.id;
        // При рендере — плавное появление
        postDiv.classList.add('fade-in');

        // Кнопка-троеточие
        const optionsBtn = document.createElement('button');
        optionsBtn.classList.add('post-options-btn');
        optionsBtn.textContent = '…';
        postDiv.appendChild(optionsBtn);

        // Контекстное меню
        const menuDiv = document.createElement('div');
        menuDiv.classList.add('post-options-menu');

        const menuUl = document.createElement('ul');
        
        // Редактировать
        const editLi = document.createElement('li');
        editLi.textContent = 'Редактировать';
        editLi.addEventListener('click', () => {
            openEditForm(post.id);
        });
        menuUl.appendChild(editLi);

        // Удалить
        const deleteLi = document.createElement('li');
        deleteLi.textContent = 'Удалить';
        deleteLi.addEventListener('click', () => {
            deletePost(post.id);
        });
        menuUl.appendChild(deleteLi);

        menuDiv.appendChild(menuUl);
        postDiv.appendChild(menuDiv);

        // При клике на троеточие - показать/скрыть меню
        optionsBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            menuDiv.style.display = (menuDiv.style.display === 'block') ? 'none' : 'block';
        });

        // При клике вне поста - скрывать меню
        document.addEventListener('click', function(e) {
            if (!postDiv.contains(e.target) && menuDiv.style.display === 'block') {
                menuDiv.style.display = 'none';
            }
        });

        // Левый блок - текст
        const textBlock = document.createElement('div');
        textBlock.classList.add('post-text');
        const p = document.createElement('p');
        p.textContent = post.text;
        textBlock.appendChild(p);

        // Правый блок - картинка
        const imageBlock = document.createElement('div');
        imageBlock.classList.add('post-image');
        if (post.imageBase64) {
            const img = document.createElement('img');
            img.src = post.imageBase64;
            imageBlock.appendChild(img);
        }

        postDiv.appendChild(textBlock);
        postDiv.appendChild(imageBlock);

        // Добавляем пост в начало списка
        blogPostsContainer.prepend(postDiv);
    });
}

// Добавление поста
function addPost(postObj) {
    let posts = loadPostsFromLocalStorage();
    posts.push(postObj);
    savePostsToLocalStorage(posts);
    renderPosts(posts);
}

// Удаление поста (с анимацией fade-out)
function deletePost(postId) {
    let posts = loadPostsFromLocalStorage();
    const postDiv = document.getElementById('post-' + postId);
    if (!postDiv) return;

    // Сначала запускаем анимацию
    postDiv.classList.remove('fade-in');
    postDiv.classList.add('fade-out');

    // После окончания анимации удаляем
    postDiv.addEventListener('animationend', () => {
        posts = posts.filter(p => p.id !== postId);
        savePostsToLocalStorage(posts);
        renderPosts(posts);
    }, { once: true });
}

// Открываем форму редактирования
function openEditForm(postId) {
    let posts = loadPostsFromLocalStorage();
    let postToEdit = posts.find(p => p.id === postId);
    if (!postToEdit) return;

    const editFormOverlay = document.getElementById('editFormOverlay');
    const editPostId = document.getElementById('editPostId');
    const editPostText = document.getElementById('editPostText');
    const editPostImage = document.getElementById('editPostImage');

    // Заполняем форму
    editPostId.value = postId;
    editPostText.value = postToEdit.text;
    editPostImage.value = '';

    // Показываем оверлей
    editFormOverlay.classList.add('show-overlay');
}

// Сохранить изменения поста
function saveEditedPost() {
    const editPostId = document.getElementById('editPostId');
    const editPostText = document.getElementById('editPostText');
    const editPostImage = document.getElementById('editPostImage');

    let posts = loadPostsFromLocalStorage();
    let postIndex = posts.findIndex(p => p.id === Number(editPostId.value));
    if (postIndex === -1) return;

    // Обновляем текст
    posts[postIndex].text = editPostText.value;

    // Если изменили картинку
    if (editPostImage.files && editPostImage.files[0]) {
        let reader = new FileReader();
        reader.onload = function(event) {
            posts[postIndex].imageBase64 = event.target.result;
            savePostsToLocalStorage(posts);
            renderPosts(posts);
        };
        reader.readAsDataURL(editPostImage.files[0]);
    } else {
        savePostsToLocalStorage(posts);
        renderPosts(posts);
    }
}

// Главная инициализация
document.addEventListener('DOMContentLoaded', function() {
    let posts = loadPostsFromLocalStorage();
    renderPosts(posts);

    // Форма добавления поста
    const postForm = document.getElementById('postForm');
    const openFormBtn = document.getElementById('openFormBtn');
    const postFormOverlay = document.getElementById('postFormOverlay');
    const cancelPostForm = document.getElementById('cancelPostForm');

    if (postForm && openFormBtn && postFormOverlay && cancelPostForm) {
        openFormBtn.addEventListener('click', function() {
            postFormOverlay.classList.add('show-overlay');
        });

        cancelPostForm.addEventListener('click', function() {
            postFormOverlay.classList.remove('show-overlay');
        });

        postForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const postImageInput = document.getElementById('postImage');
            const postTextInput = document.getElementById('postText');

            let newPostObj = {
                id: Date.now(),
                imageBase64: '',
                text: postTextInput.value
            };

            if (postImageInput.files && postImageInput.files[0]) {
                let reader = new FileReader();
                reader.onload = function(event) {
                    newPostObj.imageBase64 = event.target.result;
                    addPost(newPostObj);
                };
                reader.readAsDataURL(postImageInput.files[0]);
            } else {
                addPost(newPostObj);
            }

            postFormOverlay.classList.remove('show-overlay');
            postImageInput.value = '';
            postTextInput.value = '';
        });
    }

    // Форма редактирования
    const editForm = document.getElementById('editForm');
    const editFormOverlay = document.getElementById('editFormOverlay');
    const cancelEditForm = document.getElementById('cancelEditForm');

    if (editForm && editFormOverlay && cancelEditForm) {
        editForm.addEventListener('submit', function(e) {
            e.preventDefault();
            saveEditedPost();
            editFormOverlay.classList.remove('show-overlay');
        });

        cancelEditForm.addEventListener('click', function() {
            editFormOverlay.classList.remove('show-overlay');
        });
    }
});